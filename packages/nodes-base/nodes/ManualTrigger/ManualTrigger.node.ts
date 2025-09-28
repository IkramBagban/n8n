import type {
  INodeType,
  INodeTypeBaseDescription,
  INodeTypeDescription,
} from "../../types";

export class ManualTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Manual Trigger",
    name: "manualTrigger",
    icon: {
      type: "file",
      value: "manualTrigger.svg"
    },
    group: ["trigger"],
    version: 1,
    description: "Runs the flow on clicking a button in n8n",
    eventTriggerDescription: "",
    maxNodes: 1,
    defaults: {
      name: "When clicking ‘Execute workflow’",
      color: "#909298",
    },

    properties: [
      {
        displayName:
          'This node is where the workflow execution starts',
        name: "notice",
        type: "notice",
        default: "",
      },
    ],
  };
}
