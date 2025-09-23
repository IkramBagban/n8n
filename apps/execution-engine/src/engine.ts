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
    console.info(currentNode.name);
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

      case "telegram":
        const telegram = predefinedNodesTypes["nodes-base.telegram"];
        const response = await telegram.type.execute({
          parameters: currentNode.parameters,
          credentialId: currentNode.credentialId,
        });

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
    )?.target;
    const nextNode = this.nodes.find((node) => node.id === targetId);
    return nextNode || null;
  }
}
