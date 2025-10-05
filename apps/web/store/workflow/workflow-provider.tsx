"use client";

import { ReactNode, useState } from "react";
import { WorkflowContext } from "./workflow-context";
import { Edge, Node } from "@/lib/types";

interface Workflow { workflowId: string, nodes: Node[], edges: Edge[] }
export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [jsonOutput, setJsonOutput] = useState<Record<string, unknown> | null>(null);

  const getSelectedNode = () => {
    if (!workflow || !workflow.nodes || workflow.nodes.length < 1) return null
    return workflow.nodes?.find(node => node.id === selectedNodeId) || null
  }

  const setNodes = (nodes: Node[]) => {
    setWorkflow(prev => prev ? { ...prev, nodes } : null)
  }

  const addWorkflow = (workflow: Workflow) => setWorkflow(workflow)

  const addNode = (node: Node) => {
    setWorkflow(prev => prev ? ({
      ...prev,
      nodes: [
        ...(Array.isArray(prev?.nodes) ? prev?.nodes : []), node
      ]
    }) : null)
  }

  const nodeParameterChangeHandler = (key: string, value: unknown) => {
    setWorkflow((prev: Workflow | null) => {
      if (!prev) return prev;
      const updatedNodes = prev.nodes.map(node => {
        if (node.id === selectedNodeId) {
          node.parameters[key] = value
        }
        return node
      })
      return {
        ...prev,
        nodes: updatedNodes
      }
    })
  }

  const removeNode = (nodeId: string) => {
    setWorkflow(prev => prev ? { ...prev, nodes: prev.nodes.filter(node => node.id !== nodeId) } : null)
  }

  const nodePropertyChangeHandler = (nodeId, key, value) => {
    console.log({ nodeId, key, value })

  }

  const changePropertyOfNode = (nodeId: string, key: string, value: unknown) => {
    setWorkflow((prev: Workflow | null) => {
      if (!prev) return prev;
      const updatedNodes = prev.nodes.map(node => {
        if (node.id === nodeId) {
          (node as Record<string, unknown>)[key] = value
        }
        return node
      })
      return {
        ...prev,
        nodes: updatedNodes
      }
    })
  }

  const traverseBack = (nodeId: string, inputNodes: Record<string, unknown>, visited: Set<string> = new Set()) => {


    // Prevent infinite loops in case of circular dependencies
    if (visited.has(nodeId)) {
      console.log(`Node ${nodeId} already visited, skipping to prevent infinite loop`);
      return;
    }
    visited.add(nodeId);

    if (!workflow || !workflow.edges || !Array.isArray(workflow.edges)) {
      console.log("Workflow or edges not properly initialized:", workflow);
      return;
    }

    // Find all direct parent nodes for the current node
    const relevantEdges = workflow.edges.filter(edge => edge.target === nodeId);

    const parentNodes = relevantEdges
      .map(edge => {
        const parentNode = workflow.nodes.find(n => n.id === edge.source);
        return parentNode;
      })
      .filter(Boolean);

    parentNodes.forEach(parentNode => {
      try {
        const hasOutput = jsonOutput && jsonOutput[parentNode.id];

        if (hasOutput) {
          if (!inputNodes[parentNode.id]) {
            inputNodes[parentNode.id] = jsonOutput[parentNode.id];
          } else {
            console.log(`Output for parent node ${parentNode.id} already exists in inputNodes`);
          }
        }

        traverseBack(parentNode.id, inputNodes, visited);
      } catch (error) {
        console.log("Error traversing parent node:", parentNode?.id, error);
      }
    });

  }

  const getInputsForNode = (nodeId: string): Record<string, unknown> => {

    if (!workflow || !workflow.nodes) {
      console.log("Workflow or nodes not initialized");
      return {};
    }

    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) {
      console.log(`Node ${nodeId} not found in workflow`);
      return {};
    }

    const inputNodes: Record<string, unknown> = {};
    traverseBack(nodeId, inputNodes);

    return inputNodes;
  }

  const getJsonOutputById = (nodeId) => {
    if (!jsonOutput) return null
    return jsonOutput[nodeId] || null
  }
  const value = {
    addWorkflow,
    addNode, getSelectedNode, removeNode,
    nodePropertyChangeHandler,
    workflow,
    selectedNodeId,
    setSelectedNodeId,
    nodeParameterChangeHandler,
    setNodes,
    changePropertyOfNode,
    setJsonOutput,
    getJsonOutputById,
    getInputsForNode,
  }
  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
};
