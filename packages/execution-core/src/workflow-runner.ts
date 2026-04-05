import { predefinedNodesTypes } from "@repo/nodes-base/utils/constants";
import { ExpressionResolver } from "./expression-resolver";
import { NodeOutput } from "./node-output";
import { updateExecutionStatus } from "./helpers";
import type { Edge, ExecutionEventPublisher, ExecutionRunInput, Node } from "./types";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return "Unknown error occurred";
};

enum NodeStatus {
  success = "success",
  failed = "failed",
  executing = "executing",
}

export class WorkflowRunner {
  workflowId: string | null = null;
  executionId: string | null = null;
  nodes: Node[] = [];
  edges: Edge[] = [];
  nodeOutput: NodeOutput;
  private publisher: ExecutionEventPublisher;

  constructor(input: ExecutionRunInput, publisher: ExecutionEventPublisher) {
    this.workflowId = input.workflowId;
    this.executionId = input.executionId;
    this.nodes = input.nodes;
    this.edges = input.edges;
    this.publisher = publisher;
    this.nodeOutput = new NodeOutput();
  }

  private async publish(payload: Record<string, unknown>) {
    await this.publisher.publish(payload);
  }

  async run() {
    console.log("executing workflow", this.nodes);
    await updateExecutionStatus(this.executionId!, "Running");

    const triggerNode = this.nodes.find((node) => node.type === "trigger");

    if (!triggerNode) {
      await updateExecutionStatus(this.executionId!, "Error", true);
      await this.publish({
        executionId: this.executionId,
        status: "Failed",
        message: "There is no trigger node",
      });
      return;
    }

    try {
      await this.executeNode(triggerNode);

      console.info("Workflow execution completed successfully.");
      await updateExecutionStatus(this.executionId!, "Success", true);
      await this.publish({
        executionId: this.executionId,
        json: this.nodeOutput.json,
        status: "Success",
        message: "Workflow execution finished",
      });
    } catch (error) {
      await updateExecutionStatus(this.executionId!, "Error", true);
      console.error("Workflow execution failed:", error);
    }
  }

  async executeNode(currentNode: Node | null) {
    if (!currentNode) {
      return;
    }

    const commonPayload = {
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      executionId: this.executionId,
      workflowId: this.workflowId,
    };

    await this.publish({
      ...commonPayload,
      status: "Running",
      message: `Executing node: ${currentNode.name}`,
      nodeStatus: NodeStatus.executing,
    });

    try {
      if (currentNode.name.includes("lmChat") || currentNode.type === "model") {
        console.info(
          `Skipping model node ${currentNode.name} in main execution flow`
        );
        await this.publish({
          ...commonPayload,
          status: "Running",
          message: "Model node should be connected to an Agent node",
          nodeStatus: NodeStatus.failed,
        });

        const nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        return;
      }

      await this.executeNodeByType(currentNode, commonPayload);

      const childNodes = this.getConnectedChildNodes(currentNode);
      if (childNodes.length > 0) {
        for (const child of childNodes) {
          await this.executeNode(child.node);
        }
      }
    } catch (error: any) {
      console.error(`Error executing node ${currentNode.name}:`, error);

      const errorMessage = getErrorMessage(error);

      await this.publish({
        ...commonPayload,
        status: "Failed",
        message: `Workflow failed at node '${currentNode.name}': ${errorMessage}`,
        json: this.nodeOutput.json,
        response: {
          error: errorMessage,
        },
        nodeStatus: NodeStatus.failed,
      });

      throw error;
    }
  }

  async executeNodeByType(currentNode: Node, commonPayload: any) {
    const resolver = new ExpressionResolver(
      this.nodeOutput.getOutputsForResolver()
    );

    const resolvedParameters = resolver.resolveParameters(
      currentNode.parameters as Record<string, unknown>
    );

    console.log("Original parameters:", currentNode.parameters);
    console.log("Resolved parameters:", resolvedParameters);

    switch (currentNode.name) {
      case "manualTrigger":
        await this.publish({
          ...commonPayload,
          status: "Running",
          nodeStatus: NodeStatus.success,
        });

        this.nodeOutput.addOutput({
          nodeId: currentNode.id,
          nodeName: currentNode.name,
          json: currentNode.parameters,
        });

        break;

      case "webhook":
        await this.publish({
          ...commonPayload,
          status: "Running",
          nodeStatus: NodeStatus.success,
        });

        this.nodeOutput.addOutput({
          nodeId: currentNode.id,
          nodeName: currentNode.name,
          json: currentNode.parameters,
        });

        break;
      case "agent": {
        const agent = predefinedNodesTypes["nodes-base.agent"];

        if (!agent || !agent.type) {
          throw new Error(
            "Agent node type not found or not properly configured"
          );
        }

        const suppliedModelResult = await this.getConnectedModel(currentNode);

        if (!suppliedModelResult.success) {
          throw new Error(
            suppliedModelResult.error || "Failed to connect to model"
          );
        }

        const modelCommonPayload = {
          nodeId: suppliedModelResult.modelNodeId,
          executionId: this.executionId,
          workflowId: this.workflowId,
        };

        await this.publish({
          ...modelCommonPayload,
          status: "Running",
          message: "Model processing agent's prompt",
          nodeStatus: NodeStatus.executing,
        });

        const agentResponse = await agent.type.execute({
          parameters: resolvedParameters,
          model: suppliedModelResult.model,
        });

        if (!agentResponse || !agentResponse.success) {
          const errorMessage =
            agentResponse?.error || "Agent node execution failed";
          throw new Error(errorMessage);
        }

        this.nodeOutput.addOutput({
          nodeId: currentNode.id,
          nodeName: currentNode.name,
          json: { output: agentResponse.data?.output },
        });
        const finalResult = {
          output: agentResponse.data?.output,
          message: "Agent processed prompt using connected model",
        };

        await this.publish({
          ...commonPayload,
          status: "Running",
          response: { data: finalResult },
          nodeStatus: NodeStatus.success,
        });
        await this.publish({
          ...modelCommonPayload,
          status: "Running",
          nodeStatus: NodeStatus.success,
        });
        break;
      }

      case "telegram": {
        const telegram = predefinedNodesTypes["nodes-base.telegram"];

        if (!telegram || !telegram.type) {
          throw new Error(
            "Telegram node type not found or not properly configured"
          );
        }

        const response = await telegram.type.execute({
          parameters: resolvedParameters,
          credentialId: currentNode.credentialId,
        });

        if (!response || !response.success) {
          const errorMessage =
            response?.error || "Telegram node execution failed";
          throw new Error(errorMessage);
        }

        await this.publish({
          ...commonPayload,
          status: "Running",
          response,
          nodeStatus: NodeStatus.success,
        });

        this.nodeOutput.addOutput({
          nodeId: currentNode.id,
          nodeName: currentNode.name,
          json: response.data,
        });
        break;
      }

      case "resend": {
        const resend = predefinedNodesTypes["nodes-base.resend"];

        if (!resend || !resend.type) {
          throw new Error(
            "Resend node type not found or not properly configured"
          );
        }

        const resp = await resend.type.execute({
          parameters: resolvedParameters,
          credentialId: currentNode.credentialId,
        });

        console.log("Response from resend node:", resp);

        if (!resp || !resp.success) {
          const errorResponse = resp as any;
          const errorMessage =
            errorResponse?.error || "Resend node execution failed";
          throw new Error(errorMessage);
        }

        await this.publish({
          ...commonPayload,
          status: "Running",
          response: resp,
          nodeStatus: NodeStatus.success,
        });

        this.nodeOutput.addOutput({
          nodeId: currentNode.id,
          nodeName: currentNode.name,
          json: resp,
        });
        break;
      }

      default:
        throw new Error(
          `Unknown or unsupported node type: ${currentNode.name}`
        );
    }
  }

  getConnectedNode(currentNode: Node) {
    const currentNodeId = currentNode.id;
    const targetId = this.edges.find(
      (edge) => edge.source === currentNodeId
    )?.target;
    const nextNode = this.nodes.find((node) => node.id === targetId);
    return nextNode || null;
  }

  getConnectedChildNodes(
    parentNode: Node
  ): { node: Node; handleType: string | null }[] {
    const parentNodeId = parentNode.id;
    const childEdges = this.edges.filter((edge) => edge.source === parentNodeId);

    return childEdges
      .map((edge) => {
        const childNode = this.nodes.find((node) => node.id === edge.target);
        return childNode
          ? { node: childNode, handleType: edge.sourceHandle || null }
          : null;
      })
      .filter(
        (child): child is { node: Node; handleType: string | null } => !!child
      );
  }

  async getConnectedModel(agentNode: Node) {
    const childNodes = this.getConnectedChildNodes(agentNode);
    const modelNodes = childNodes.filter(
      (child) =>
        child?.handleType === "chat-model" ||
        child?.node.name.includes("lmChat")
    );

    if (modelNodes.length === 0) {
      return {
        success: false,
        model: null,
        error:
          "Problem in node 'AI Agent'\nA Chat Model sub-node must be connected and enabled",
      };
    }

    if (modelNodes.length > 1) {
      return {
        success: false,
        error: `Agent can only have one model connected. Found ${modelNodes.length} models.`,
      };
    }

    const modelChild = modelNodes[0];
    if (!modelChild?.node) {
      return { success: false, error: "Invalid model connection" };
    }

    const modelNode = modelChild.node;
    const modelName = modelNode.name;

    if (
      !Object.keys(predefinedNodesTypes).includes(`nodes-base.${modelName}`)
    ) {
      return { success: false, error: `Unsupported model type: ${modelName}` };
    }

    const llmModel =
      predefinedNodesTypes[
        `nodes-base.${modelName}` as keyof typeof predefinedNodesTypes
      ];

    this.nodes = this.nodes.filter((node) => node.id !== modelNode.id);

    const modelSupplyResult = await (llmModel.type as any).supplyData({
      parameters: modelNode.parameters,
      credentialId: modelNode.credentialId,
    });

    if (modelSupplyResult.success) {
      return {
        success: true,
        model: modelSupplyResult.response,
        modelNodeId: modelNode.id,
      };
    }

    return {
      success: false,
      error: `Model ${modelNode.name} failed to supply: ${modelSupplyResult.error}`,
    };
  }
}

export const runWorkflowExecution = async (
  input: ExecutionRunInput,
  publisher: ExecutionEventPublisher
) => {
  const runner = new WorkflowRunner(input, publisher);
  await runner.run();
};
