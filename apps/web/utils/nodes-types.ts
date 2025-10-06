import { TriggerNode } from "@/components/custom-nodes/TriggerNode";
import { ActionNode } from "@/components/custom-nodes/ActionNode";
import { AgentNode } from "@/components/custom-nodes/AgentNode";
import { ModelNode } from "@/components/custom-nodes/ModelNode";
import { ToolNode } from "@/components/custom-nodes/ToolNode";

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  agent: AgentNode,
  model: ModelNode,
  tools: ToolNode,
};
