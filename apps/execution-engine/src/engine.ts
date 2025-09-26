import prismaClient from "@repo/db";
import { predefinedNodesTypes } from "@repo/nodes-base/utils/constants";
import type { Edge, Node } from "./utils/types";
import { createClient } from "redis";
import { createRedisClient } from "./lib/redis";

const publisher = await createRedisClient();

const publishDataToPubSub = async (payload: Record<string, any>) => {
  console.log("Publishing...");
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
  }

  async run() {
    console.log("executing workflow");
    const triggerNode = this.nodes.find((node) => node.type === "trigger");

    if (!triggerNode) {
      console.info("There is no trigger node");
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
    console.info(
      `Executing node: ${currentNode.name} (type: ${currentNode.type})`
    );

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

        const agentResponse = await agent.type.execute({
          parameters: currentNode.parameters,
        });

        console.log("Response from agent node:", agentResponse);

        if (!agentResponse.success) {
          await publishDataToPubSub({
            ...commonPayload,
            status: "Failed",
            response: agentResponse,
            nodeStatus: NodeStatus.failed,
          });
          return;
        }

        // Get the connected model (required for agent)
        const suppliedModelResult = await this.getConnectedModel(currentNode);

        console.log("Connected model result:", suppliedModelResult);

        if (!suppliedModelResult.success) {
          await publishDataToPubSub({
            ...commonPayload,
            status: "Failed",
            response: { error: suppliedModelResult.error },
            nodeStatus: NodeStatus.failed,
          });
          return;
        }

        // Agent MUST have a model connected - this is required in n8n
        if (!suppliedModelResult.model) {
          await publishDataToPubSub({
            ...commonPayload,
            status: "Failed",
            response: {
              error:
                "Problem in node 'AI Agent'\nA Chat Model sub-node must be connected and enabled",
            },
            nodeStatus: NodeStatus.failed,
          });
          return;
        }

        const userPrompt = agentResponse.data?.prompt;

        if (!userPrompt) {
          await publishDataToPubSub({
            ...commonPayload,
            status: "Failed",
            response: { error: "No prompt received from agent" },
            nodeStatus: NodeStatus.failed,
          });
          return;
        }

        const connectedModel = suppliedModelResult.model;

        if (!connectedModel.modelInstance) {
          await publishDataToPubSub({
            ...commonPayload,
            status: "Failed",
            response: { error: "Model instance not available" },
            nodeStatus: NodeStatus.failed,
          });
          return;
        }

        console.log(
          `Using model ${connectedModel.modelName} to process prompt: "${userPrompt}"`
        );

        const modelCommonPayload = {
          nodeId: connectedModel.modelId,
          nodeName: connectedModel.modelName,
          executionId: this.executionId,
          workflowId: this.workflowId,
        };

        await publishDataToPubSub({
          ...modelCommonPayload,
          status: "Running",
          message: "Model processing agent's prompt",
          nodeStatus: NodeStatus.executing,
        });

        const modelResponse =
          await connectedModel.modelInstance.generateResponse(userPrompt);

        if (modelResponse.success) {
          await publishDataToPubSub({
            ...modelCommonPayload,
            status: "Running",
            response: modelResponse,
            nodeStatus: NodeStatus.success,
          });

          const finalResult = {
            agent: {
              prompt: userPrompt,
              timestamp: agentResponse.data?.timestamp,
            },
            model: {
              modelId: connectedModel.modelId,
              modelName: connectedModel.modelName,
              response: modelResponse.response,
              usage: modelResponse.usage,
            },
            message: "Agent processed prompt using connected model",
          };

          await publishDataToPubSub({
            ...commonPayload,
            status: "Running",
            response: { data: finalResult },
            nodeStatus: NodeStatus.success,
          });
        } else {
          await publishDataToPubSub({
            ...modelCommonPayload,
            status: "Failed",
            response: modelResponse,
            nodeStatus: NodeStatus.failed,
          });
          return;
        }

        nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        break;

      case "telegram":
        const telegram = predefinedNodesTypes["nodes-base.telegram"];
        const response = await telegram.type.execute({
          parameters: currentNode.parameters,
          credentialId: currentNode.credentialId,
        });
        console.log("Response from telegram node:", response);

        if (!response.success) {
          await publishDataToPubSub({
            ...commonPayload,
            status: "Failed",
            response,
            nodeStatus: NodeStatus.failed,
          });
          return;
        }

        // i have to add check here, if the workflow message is sent successfully or not.
        // if the message is not sent successfully then i have to stop the workflow execution and update the execution status to failed.
        await publishDataToPubSub({
          ...commonPayload,
          status: "Running",
          response,
          nodeStatus: NodeStatus.success,
        });

        nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        break;

      case "resend":
        const resend = predefinedNodesTypes["nodes-base.resend"];
        const resp = await resend.type.execute({
          parameters: currentNode.parameters,
          credentialId: currentNode.credentialId,
        });

        await publishDataToPubSub({
          ...commonPayload,
          status: "Running",
          response: resp,
          nodeStatus: NodeStatus.success,
        });
        nextNode = this.getConnectedNode(currentNode);
        await this.executeNode(nextNode);
        break;
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
    console.log("Agent child nodes:", childNodes);
    const modelNodes = childNodes.filter(
      (child) =>
        child?.handleType === "chat-model" ||
        child?.node.name.includes("lmChat")
    );
    console.log("Filtered model nodes:", modelNodes);

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

    console.log(`Getting required model from: ${modelNode.name}`);

    // Get the model instance supplied by the model node
    if (modelNode.name === "lmChatGoogleGemini") {
      const geminiModel = predefinedNodesTypes["nodes-base.lmChatGoogleGemini"];

      const modelSupplyResult = await geminiModel.type.supplyData({
        parameters: modelNode.parameters,
        credentialId: modelNode.credentialId,
      });

      if (modelSupplyResult.success) {
        return {
          success: true,
          model: {
            modelId: modelNode.id,
            modelName: modelNode.name,
            modelInstance: modelSupplyResult.response,
          },
        };
      } else {
        return {
          success: false,
          error: `Model ${modelNode.name} failed to supply: ${modelSupplyResult.error}`,
        };
      }
    }

    return {
      success: false,
      error: `Unsupported model type: ${modelNode.name}`,
    };
  }
}
