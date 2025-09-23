
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
}
