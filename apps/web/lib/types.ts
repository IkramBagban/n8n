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

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    type: string;
    name: string;
    icon?: {
      type: string;
      value: string;
    } | null;
  };
}

export interface WorkflowListProps {
  workflows: Workflow[];
  totalCount: number;
}

export interface ExecutionData {
  id: string;
  workflowId: string | null;
  workflowName: string;
  status: 'Canceled' | 'Crashed' | 'Error' | 'Starting' | 'Running' | 'Success';
  finished: boolean;
  startedAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
  runtimeMs: number;
  runtimeFormatted: string;
}

export interface ExecutionsResponse {
  executions: ExecutionData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  filters: {
    status?: string;
    workflowId?: string;
  };
}
