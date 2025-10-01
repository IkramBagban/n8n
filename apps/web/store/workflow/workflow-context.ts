import { Edge, Node } from "@/lib/types";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

type Workflow = {
  workflowId: string;
  nodes: Node[];
  edges: Edge[];
  jsonOutput?: Record<string, any>;
};

type WorkflowContextType = {
  addWorkflow: (workflow: Workflow) => void;
  addNode: Dispatch<SetStateAction<Node>>;
  getSelectedNode: () => Node | null;
  removeNode: (nodeId: string) => void;
  workflow: Workflow;
  selectedNodeId: string;
  setSelectedNodeId: Dispatch<SetStateAction<string>>;
  changePropertyOfNode: (nodeId: string, key: string, value: any) => void;
  nodeParameterChangeHandler: (key: string, value: any) => void;
  setNodes: (nodes: Node[]) => void;
  setJsonOutput: (jsonOutput: Record<string, any>) => void;
  getJsonOutputById: (nodeId) => any;
};

export const WorkflowContext = createContext<WorkflowContextType>({
  addWorkflow: (workflow: Workflow) => { },
  addNode: () => { },
  getSelectedNode: () => null,
  removeNode: () => { },
  selectedNodeId: null,
  setSelectedNodeId: () => { },
  changePropertyOfNode: (nodeId, key, value) => { },
  workflow: { workflowId: "", nodes: [], edges: [], jsonOutput: {} },
  nodeParameterChangeHandler: (key, value) => { },
  setNodes: (nodes: Node[]) => { },
  setJsonOutput: (jsonOutput: Record<string, any>) => { },
  getJsonOutputById: (nodeId) => null
});

export const useWorkflowCtx = () => useContext(WorkflowContext);
