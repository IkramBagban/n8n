'use client'
import { useState, useCallback, useEffect, use } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { User, Star, Github, Layers } from 'lucide-react';
import Link from 'next/link';
import { workflows } from '@/app/utils/constants';
import axios from 'axios';


export default function App({ params }: { params: Promise<{ workflowId: string }> }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [workflowData, setWorkflowData] = useState(null);
  const { workflowId } = use(params)
  // const id = await params.workflowId;


  console.log("nodes and edges", { nodes, edges });
  console.log({ nodes, edges })
  useEffect(() => {
    const getWorkflowData = async () => {

      const response = await axios.get(`/api/rest/workflows/${workflowId}`);

      console.log("workflowId", workflowId);
      console.log("workflow data", response.data);
      setNodes(response.data.data.nodes || []);
      setEdges(response.data.data.edges || []);
      setWorkflowData(response.data.data || null);
    }

    getWorkflowData();
  }, [workflowId]);

  const saveWorkflow = async () => {
    try {
      const response = await axios.patch(`/api/rest/workflows/${workflowId}`, {
        name: workflowData.name,
        nodes: nodes.map(node => ({ ...node, workflowId: undefined, measured: undefined, selected: undefined, dragging: undefined, searchNode: undefined })),
        edges,
        active: workflowData.active,
        tags: workflowData.tags,
        projectId: workflowData.projectId,
      });
      console.log("Save response", response.data);
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error("Error saving workflow", error);
      alert('Error saving workflow. Please try again.');
    }
  };



  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const createNode = useCallback(() => {
    const label = prompt("Enter node label:");
    const type = prompt("Enter node type:");

    if (!label) return;
    const newNode = {
      id: (nodes.length + 1).toString(),
      parameters: {},
      position: { x: 0, y: 0 },
      data: { label: label || `Node ${nodes.length + 1}` },
      type,
      name: "have to see this"
    };
    setNodes((nodesSnapshot) => [...nodesSnapshot, newNode]);
  }, [nodes]);

  const getProjectIcon = (project: any) => {
    if (project?.type === 'personal') {
      return <User className="w-4 h-4" />;
    }
    return <Layers className="w-4 h-4" />;
  };

  if (!workflowId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading workflow...</div>
      </div>
    );
  }

  if (workflowData === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-gray-900 text-lg font-medium mb-2">Workflow not found</div>
        <div className="text-gray-500 mb-4">The workflow with ID &quot;{workflowId}&quot; does not exist.</div>
        <Link href="/home/workflows">
          <Button variant="outline">
            Back to Workflows
          </Button>
        </Link>
      </div>
    );
  }

  // Display loading state if workflow data is still being loaded
  if (!workflowData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading workflow...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/projects/${workflowData.homeProject.id}`} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
                    {getProjectIcon(workflowData.homeProject)}
                    {workflowData.homeProject.type === 'personal' ? 'Personal' : workflowData.homeProject.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-gray-900">
                  {workflowData.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button variant="outline" size="sm" onClick={createNode}>
            + Add Node
          </Button>

          {workflowData.tags && workflowData.tags.length > 0 && (
            <div className="flex gap-2">
              {workflowData.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {workflowData.active ? 'Active' : 'Inactive'}
            </span>
            <Switch checked={workflowData.active} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Share
            </Button>
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={saveWorkflow}>
              Save
            </Button>
          </div>

          {/* GitHub stars */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="https://github.com/IkramBagban/n8n"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
            >
              <Github className="w-4 h-4" />
              {/* <Star className="w-4 h-4" />
              <span>137,228</span> */}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center px-6">
          <button className="px-4 py-3 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
            Editor
          </button>
          <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
            Executions
          </button>
          <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
            Evaluations
          </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}