export type Node = {
  id: string;
  type: string;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  data: Record<string, any>;
  name: string;
  credentialId?: string;
};

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ExecutionJob {
  workflowId: string;
  executionId: string;
}

export interface ExecutionRunInput {
  workflowId: string;
  executionId: string;
  nodes: Node[];
  edges: Edge[];
}

export interface ExecutionEventPublisher {
  publish(payload: Record<string, unknown>): Promise<void>;
}

export interface ExecutionEngine {
  execute(job: ExecutionJob): Promise<void>;
}
