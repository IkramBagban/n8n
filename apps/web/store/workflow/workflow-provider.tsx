"use client";

import { ReactNode, useState } from "react";
import { WorkflowContext } from "./workflow-context";
import { Edge, Node } from "@/lib/types";

interface Workflow { workflowId: string, nodes: Node[], edges: Edge[] }
export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [workflow, setWorkflow] = useState<Workflow>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const getSelectedNode = () => {
    console.log("workflow.nodes", workflow.nodes)
    if (workflow.nodes?.length < 1) return null
    return workflow.nodes?.find(node => node.id === selectedNodeId) || null
  }

  const addWorkflow = (workflow: Workflow) => setWorkflow(workflow)
  const addNode = (node: Node) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: [
        ...prev.nodes, node

      ]
    }))
  }

  const nodeParameterChangeHandler = (key: string, value: any) => {
    setWorkflow((prev: Workflow) => {
      console.log("prev", prev)

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
    setWorkflow(prev => ({ ...prev, nodes: prev.nodes.filter(node => node.id !== nodeId) }))
  }


  const nodePropertyChangeHandler = (nodeId, key, value) => {
    console.log({ nodeId, key, value })

  }
  const value = {
    addWorkflow,
    addNode, getSelectedNode, removeNode,
    nodePropertyChangeHandler,
    workflow,
    selectedNodeId,
    setSelectedNodeId,
    nodeParameterChangeHandler
  }
  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
};
