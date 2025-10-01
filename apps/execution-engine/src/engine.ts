import { predefinedNodesTypes } from "@repo/nodes-base/utils/constants";
import type { Edge, Node } from "./utils/types";
import { createRedisClient } from "./lib/redis";
import { NodeOutput } from "./lib/node-output";

const publisher = await createRedisClient();

const publishDataToPubSub = async (payload: Record<string, any>) => {
  await publisher.publish(
    `execution-${payload.executionId}`,
    JSON.stringify({ ...payload })
  );
};

enum NodeStatus {
  success = "success",
  failed = "failed",
  executing = "executing",
}

export class Engine {
  workflowId: string | null = null;
  executionId: string | null = null;
  nodes: Node[] = [];
  edges: Edge[] = [];
  nodeOutput: NodeOutput;
  constructor(
    workflowId: string,
    executionId: string,
    nodes: Node[],
    edges: Edge[]
  ) {
    this.workflowId = workflowId;
    this.executionId = executionId;
    this.nodes = nodes;
    this.edges = edges;
    this.nodeOutput = new NodeOutput();
  }

  async run() {
    console.log("executing workflow");
    const triggerNode = this.nodes.find((node) => node.type === "trigger");

    if (!triggerNode) {
      await publishDataToPubSub({
        executionId: this.executionId,
        status: "Failed",

        message: "There is no trigger node",
      });

      return;
    }

    await this.executeNode(triggerNode);
  }

  async executeNode(currentNode: Node | null) {
    if (!currentNode) {
      console.info("No more nodes to execute. Workflow finished.");
      await publishDataToPubSub({
        executionId: this.executionId,
        json: this.nodeOutput.json,
        status: "Success",
        message: "Workflow execution finished",
      });

      return;
    }

    const commonPayload = {
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      executionId: this.executionId,
      workflowId: this.workflowId,
    };

    await publishDataToPubSub({
      ...commonPayload,
      status: "Workflow started",
      message: "Workflow execution started",
      nodeStatus: NodeStatus.executing,
    });

    let nextNode;

    try {
      // Skip model nodes if they somehow end up in main execution flow
      if (currentNode.name.includes("lmChat") || currentNode.type === "model") {
        console.info(
          `Skipping model node ${currentNode.name} in main execution flow`
        );
        await publishDataToPubSub({
          ...commonPayload,
          status: "Running",
          message: "Model node skipped - should be used by agent nodes",
          nodeStatus: NodeStatus.success,
        });

        nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        return;
      }

      await this.executeNodeByType(currentNode, commonPayload);
    } catch (error: any) {
      console.error(`Error executing node ${currentNode.name}:`, error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && error.message) {
        errorMessage = error.message;
      }

      await publishDataToPubSub({
        ...commonPayload,
        status: "Failed",
        message: `Node execution failed: ${errorMessage}`,
        json: this.nodeOutput.json,
        response: {
          error: errorMessage,
          stack: error.stack || "No stack trace available",
        },
        nodeStatus: NodeStatus.failed,
      });
      return;
    }
  }

  async executeNodeByType(currentNode: Node, commonPayload: any) {
    let nextNode;

    switch (currentNode.name) {
      case "manualTrigger":
        nextNode = this.getConnectedNode(currentNode);

        await publishDataToPubSub({
          ...commonPayload,
          status: "Running",
          nodeStatus: NodeStatus.success,
        });

        await this.executeNode(nextNode);
        break;

      case "agent":
        const agent = predefinedNodesTypes["nodes-base.agent"];

        if (!agent || !agent.type) {
          throw new Error(
            "Agent node type not found or not properly configured"
          );
        }

        // Get the connected model (required for agent)
        const suppliedModelResult = await this.getConnectedModel(currentNode);

        if (!suppliedModelResult.success) {
          throw new Error(
            suppliedModelResult.error || "Failed to connect to model"
          );
        }

        // Agent MUST have a model connected
        if (!suppliedModelResult.model) {
          throw new Error(
            "Problem in node 'AI Agent'\nA Chat Model sub-node must be connected and enabled"
          );
        }

        const agentResponse = await agent.type.execute({
          parameters: currentNode.parameters,
          model: suppliedModelResult.model,
        });

        if (!agentResponse || !agentResponse.success) {
          const errorMessage =
            agentResponse?.error ||
            agentResponse?.message ||
            "Agent node execution failed";
          throw new Error(errorMessage);
        }

        const modelCommonPayload = {
          nodeId: suppliedModelResult.modelNodeId,
          executionId: this.executionId,
          workflowId: this.workflowId,
        };

        await publishDataToPubSub({
          ...modelCommonPayload,
          status: "Running",
          message: "Model processing agent's prompt",
          nodeStatus: NodeStatus.executing,
        });

        this.nodeOutput.addOutput({
          nodeId: currentNode.id,
          nodeName: currentNode.name,
          json: { output: agentResponse.data?.output },
        });
        const finalResult = {
          output: agentResponse.data?.output, // ai output it is
          message: "Agent processed prompt using connected model",
        };

        await publishDataToPubSub({
          ...commonPayload,
          status: "Running",
          response: { data: finalResult },
          nodeStatus: NodeStatus.success,
        });

        nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        break;

      case "telegram":
        const telegram = predefinedNodesTypes["nodes-base.telegram"];

        if (!telegram || !telegram.type) {
          throw new Error(
            "Telegram node type not found or not properly configured"
          );
        }

        const response = await telegram.type.execute({
          parameters: currentNode.parameters,
          credentialId: currentNode.credentialId,
        });

        if (!response || !response.success) {
          const errorMessage =
            response?.error ||
            response?.message ||
            "Telegram node execution failed";
          throw new Error(errorMessage);
        }

        await publishDataToPubSub({
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

        nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        break;

      case "resend":
        const resend = predefinedNodesTypes["nodes-base.resend"];

        if (!resend || !resend.type) {
          throw new Error(
            "Resend node type not found or not properly configured"
          );
        }

        const resp = await resend.type.execute({
          parameters: currentNode.parameters,
          credentialId: currentNode.credentialId,
        });

        console.log("Response from resend node:", resp);

        if (!resp || !resp.success) {
          const errorMessage =
            resp?.error || resp?.message || "Resend node execution failed";
          throw new Error(errorMessage);
        }

        await publishDataToPubSub({
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

        nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        break;

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
      // (edge) => edge.source === currentNodeId && !edge.sourceHandle // Only main workflow connections, not sub-component connections
    )?.target;
    const nextNode = this.nodes.find((node) => node.id === targetId);
    return nextNode || null;
  }

  // Find connected child nodes (nodes connected to agent's bottom handles)
  getConnectedChildNodes(parentNode: Node) {
    const parentNodeId = parentNode.id;
    const childEdges = this.edges.filter(
      (edge) => edge.source === parentNodeId // here i should add sourceHandle wala conndition as well, but currently i haven't added that in reactflow node
    );

    const childNodes = childEdges
      .map((edge) => {
        const childNode = this.nodes.find((node) => node.id === edge.target);
        return childNode
          ? { node: childNode, handleType: edge.sourceHandle }
          : null;
      })
      .filter(Boolean);

    return childNodes;
  }

  // Get the connected model instance from the agent node (required - one model must be connected)
  async getConnectedModel(agentNode: Node) {
    const childNodes = this.getConnectedChildNodes(agentNode);
    const modelNodes = childNodes.filter(
      (child) =>
        child?.handleType === "chat-model" ||
        child?.node.name.includes("lmChat")
    );

    if (modelNodes.length === 0) {
      // No model connected - this is required for agents
      return { success: true, model: null }; // Let the calling code handle the validation
    }

    if (modelNodes.length > 1) {
      // Multiple models connected - this is not allowed
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

    // Get the model instance supplied by the model node
    console.log("model name:", modelNode.name);
    const llmModel = predefinedNodesTypes[`nodes-base.${modelName}`]; // #Todo: satisfy it's type

    const modelSupplyResult = await llmModel.type.supplyData({
      parameters: modelNode.parameters,
      credentialId: modelNode.credentialId,
    });

    if (modelSupplyResult.success) {
      return {
        success: true,
        model: modelSupplyResult.response,
        modelNodeId: modelNode.id,
      };
    } else {
      return {
        success: false,
        error: `Model ${modelNode.name} failed to supply: ${modelSupplyResult.error}`,
      };
    }
  }
}
