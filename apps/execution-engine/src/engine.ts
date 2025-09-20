import { predefinedNodesTypes } from "@repo/nodes-base/utils/constants";

export type Node = {
  id: string;
  type: string;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  data: Record<string, any>;
  name: string;
};

interface Edge {
  id: string;
  source: string;
  target: string;
}

export class Engine {
  constructor() {
    console.log("Engine created");
  }

  run({
    workflowId,
    nodes,
    edges,
  }: {
    workflowId: string;
    nodes: Node[];
    edges: Edge[];
  }) {
    console.log("executing workflow");
    const triggerNode = nodes.find((node) => node.type === "trigger");
    if (!triggerNode) return console.info("There is on trigger node");
    this.executeNode(triggerNode, nodes, edges);
  }

  async executeNode(currentNode: Node | null, nodes: Node[], edges: Edge[]) {
    if (!currentNode) return console.error("workflow executed successfully");
    let isLastNode = false;
    let nextNode;
    console.info(currentNode.name);
    switch (currentNode.name) {
      case "manualTrigger":
        nextNode = this.getConnectedNode(currentNode, nodes, edges);
        this.executeNode(nextNode, nodes, edges);
        break;

      case "telegram":
        const telegram = predefinedNodesTypes["nodes-base.telegram"];
        const response = await telegram.type.execute({
          parameters: currentNode.parameters,
        });

        nextNode = this.getConnectedNode(currentNode, nodes, edges);
        this.executeNode(nextNode, nodes, edges);
        break;
    }
  }

  getConnectedNode(currentNode: Node, nodes: Node[], edges: Edge[]) {
    const currentNodeId = currentNode.id;
    const targetId = edges.find(
      (edge) => edge.source === currentNodeId
    )?.target;
    const nextNode = nodes.find((node) => node.id === targetId);
    return nextNode || null;
  }
}
