"use client";
import { useState, useCallback, useEffect } from "react";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Edge,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Node } from "@/lib/types";
import { useWorkflowCtx } from "@/store/workflow/workflow-context";

interface WorkflowData {
  id?: string;
  name: string;
  active: boolean;
  tags?: string[];
  projectId: string;
  homeProject: {
    id: string;
    name: string;
    type: "personal" | "team";
  };
}

interface UseWorkflowEditorProps {
  workflowId?: string;
  projectId?: string;
  isNewWorkflow?: boolean;
}

export const useWorkflowEditor = ({
  workflowId,
  projectId,
  isNewWorkflow = false,
}: UseWorkflowEditorProps = {}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const workflowCtx = useWorkflowCtx();

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  const createNode = useCallback(() => {
    const label = prompt("Enter node label:");
    const type = prompt("Enter node type:");

    if (!label) return;

    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      name: "Node",
      parameters: {},
      data: {
        label: label || `Node ${nodes.length + 1}`,
        nodeType: type || "default",
      },
    };

    setNodes((nodesSnapshot) => [...nodesSnapshot, newNode]);
  }, [nodes.length]);

  const loadWorkflow = useCallback(async () => {
    if (!workflowId || isNewWorkflow) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/rest/workflows/${workflowId}`);
      const data = response.data.data;

      setWorkflowData(data);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      workflowCtx.addWorkflow(data);
    } catch (err) {
      console.error("Error loading workflow:", err);
      setError("Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, isNewWorkflow]);

  const saveWorkflow = useCallback(async () => {
    if (!workflowData && !isNewWorkflow) return;

    setIsLoading(true);
    setError(null);

    try {
      const cleanNodes = nodes.map((node) => ({
        ...node,
        workflowId: undefined,
        measured: undefined,
        selected: undefined,
        dragging: undefined,
        searchNode: undefined,
      }));

      const payload = {
        name: workflowData?.name || "New Workflow",
        nodes: cleanNodes,
        edges,
        active: workflowData?.active || false,
        tags: workflowData?.tags || [],
        projectId: workflowData?.projectId || projectId,
      };

      let response;
      if (isNewWorkflow) {
        response = await axios.post("/api/rest/workflows", payload);
        router.push(`/workflow/${response.data.data.id}`);
      } else {
        response = await axios.patch(
          `/api/rest/workflows/${workflowId}`,
          payload
        );
      }

      console.log("Save response:", response.data);

      if (isNewWorkflow && response.data.data) {
        setWorkflowData(response.data.data);
      }

      return response.data;
    } catch (err) {
      console.error("Error saving workflow:", err);
      setError("Failed to save workflow");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [
    workflowData,
    nodes,
    edges,
    isNewWorkflow,
    workflowId,
    projectId,
    router,
  ]);

  const initializeNewWorkflow = useCallback(async () => {
    if (!isNewWorkflow || !projectId) return;

    try {
      const projectResponse = await axios.get(
        `/api/rest/projects/${projectId}`
      );
      const project = projectResponse.data.data;

      setWorkflowData({
        name: "Untitled Workflow",
        active: false,
        tags: [],
        projectId: projectId,
        homeProject: {
          id: project.id,
          name: project.name,
          type: project.type || "personal", // this fild is currently not present in db the schema
        },
      });
    } catch (err) {
      console.error("Error initializing new workflow:", err);
      setError("Failed to initialize new workflow");
    }
  }, [isNewWorkflow, projectId]);

  const updateWorkflowData = useCallback((updates: Partial<WorkflowData>) => {
    setWorkflowData((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Load workflow on mount
  useEffect(() => {
    if (isNewWorkflow) {
      initializeNewWorkflow();
    } else {
      loadWorkflow();
    }
  }, [isNewWorkflow, initializeNewWorkflow, loadWorkflow]);

  return {
    nodes,
    edges,
    workflowData,
    isLoading,
    error,

    setNodes,
    setEdges,
    updateWorkflowData,

    // ReactFlow handlers
    onNodesChange,
    onEdgesChange,
    onConnect,

    createNode,
    saveWorkflow,
    loadWorkflow,
    isNewWorkflow,
  };
};
