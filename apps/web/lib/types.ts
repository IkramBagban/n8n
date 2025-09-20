export type Node = {
  id: string;
  type: string;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  data: Record<string, any>;
  name: string;
};

export interface Edge {
  id: string;
  source: string;
  target: string;
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
