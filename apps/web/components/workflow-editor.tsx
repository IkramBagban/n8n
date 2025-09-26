'use client'

import { useState, useMemo, useEffect } from 'react';
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';
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
} from "@/components/ui/breadcrumb";
import {
    User,
    Github,
    Layers,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { useWorkflowEditor } from '@/hooks/useWorkflowEditor';
import { WorkflowSidebar, type NodeItem } from '@/components/workflow-sidebar';
import { NodeConfigModal } from '@/components/node-config-modal';
import { nodeTypes } from '@/utils/nodes-types';
import { Node } from '@/lib/types';
import axios from 'axios';
import { useWorkflowCtx } from '@/store/workflow/workflow-context';

interface ExecutionMessage {
    nodeId?: string;
    nodeName?: string;
    executionId: string;
    workflowId?: string;
    status: string;
    message?: string;
    nodeStatus?: 'executing' | 'success' | 'failed';
    response?: unknown;
}

interface NodeExecutionState {
    [nodeId: string]: {
        status: 'idle' | 'executing' | 'success' | 'failed';
        message?: string;
        response?: unknown;
    };
}

interface WorkflowEditorProps {
    workflowId?: string;
    projectId?: string;
    isNewWorkflow?: boolean;
}

export function WorkflowEditor({ workflowId, projectId, isNewWorkflow = false }: WorkflowEditorProps) {
    const {
        nodes,
        edges,
        workflowData,
        isLoading,
        setNodes,
        onNodesChange,
        onEdgesChange,
        onConnect,
        saveWorkflow,
        updateWorkflowData,
    } = useWorkflowEditor({ workflowId, projectId, isNewWorkflow });

    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'triggers' | 'actions'>('triggers');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<ExecutionMessage[]>([]);
    const [nodeExecutionStates, setNodeExecutionStates] = useState<NodeExecutionState>({});
    const [isExecuting, setIsExecuting] = useState(false);

    const workflowCtx = useWorkflowCtx()

    // Compute nodes with execution status
    const nodesWithExecutionStatus = useMemo(() => {
        return nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                executionStatus: nodeExecutionStates[node.id]?.status || 'idle'
            }
        }));
    }, [nodes, nodeExecutionStates]);


    const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
        console.log('executionLogs', executionLogs);
        setSelectedNode(node);
        workflowCtx.setSelectedNodeId(node.id)
        setIsNodeModalOpen(true);
    };

    const handleNodeModalClose = () => {
        setIsNodeModalOpen(false);
        workflowCtx.setSelectedNodeId(null)
        setSelectedNode(null);
    };

    const handleNodeSave = (updatedNode: Node) => {
        setNodes((currentNodes) => {

            const updatedNodes = currentNodes.map((node) =>
                node.id === updatedNode.id ? updatedNode : node
            )


            workflowCtx.setNodes(updatedNodes)
            return updatedNodes
        });
    };

    const handleAddNode = () => {
        if (nodes.length === 0) {
            setSidebarMode('triggers');
        } else {
            setSidebarMode('actions');
        }
        setIsSidebarOpen(true);
    };

    const handleNodeSelect = (nodeItem: NodeItem) => {
        // Determine node type based on group or category
        let nodeType: string;
        if (nodeItem.group?.includes('trigger') || nodeItem.category === 'triggers' || sidebarMode === 'triggers') {
            nodeType = 'trigger';
        } else if (nodeItem.group?.includes('ai') || nodeItem.name === 'agent') {
            nodeType = 'agent';
        } else if (nodeItem.group?.includes('model')) {
            nodeType = 'model';
        } else {
            nodeType = 'action';
        }

        const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newNode = {
            id: nodeId,
            position: { x: Math.random() * 20, y: Math.random() * 5 },
            name: nodeItem.name,
            description: nodeItem.description,
            type: nodeType,
            parameters: {},
            data: {
                label: nodeItem.displayName || nodeItem.name,
                nodeType: nodeItem.id,
                category: nodeItem.category || nodeItem.group?.[0] || 'default',
                credentials: nodeItem.credentials, // this tells which credential we want.
                properties: nodeItem.properties
            },
        };

        console.log("new node", newNode)
        workflowCtx.addNode(newNode)

        setNodes((currentNodes) => [...currentNodes, newNode]);
        setIsSidebarOpen(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveWorkflow();
            alert('Workflow saved successfully!');
        } catch (error) {
            console.error("Error saving workflow:", error);
            alert('Error saving workflow. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecuteWorkflow = async () => {
        // Reset execution states for clean start
        setNodeExecutionStates({});
        setExecutionLogs([]);
        setIsExecuting(true);

        const eventSource = new EventSource("/api/rest/workflows/execute?workflowId=" + workflowId);

        eventSource.onopen = (event) => {
            console.log("Connection opened:", event);
        }

        eventSource.onmessage = (event) => {
            const parsedData: ExecutionMessage = JSON.parse(event.data);
            console.log("Message received:", parsedData);

            // Add to execution logs
            setExecutionLogs((currentLogs) => [...currentLogs, parsedData]);

            // Update node execution states
            if (parsedData.nodeId) {
                setNodeExecutionStates((prevStates) => ({
                    ...prevStates,
                    [parsedData.nodeId!]: {
                        status: parsedData.nodeStatus === 'executing' ? 'executing' :
                            parsedData.nodeStatus === 'success' ? 'success' :
                                parsedData.nodeStatus === 'failed' ? 'failed' : 'idle',
                        message: parsedData.message,
                        response: parsedData.response,
                    }
                }));
            }

            // Check if workflow execution finished
            if (parsedData.status === "Success" || parsedData.status === "Failed") {
                setIsExecuting(false);
                eventSource.close();
            }
        }

        eventSource.onerror = (error) => {
            console.error("Error occurred:", error);
            setIsExecuting(false);
            eventSource.close();
        }
    }

    const handleToggleActive = () => {
        if (workflowData) {
            updateWorkflowData({ active: !workflowData.active });
        }
    };

    const getProjectIcon = (project: { type?: string }) => {
        if (project?.type === 'personal') {
            return <User className="w-4 h-4" />;
        }
        return <Layers className="w-4 h-4" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading workflow...</div>
            </div>
        );
    }

    if (!isNewWorkflow && !workflowData) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-gray-900 text-lg font-medium mb-2">Workflow not found</div>
                <div className="text-gray-500 mb-4">
                    The workflow{workflowId ? ` with ID "${workflowId}"` : ''} does not exist.
                </div>
                <Link href="/home/workflows">
                    <Button variant="outline">
                        Back to Workflows
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-full">

        <div className="w-13 h-13 absolute right-10 top-30 border border-black bg-white flex flex-col items-center py-4 space-y-4 rounded-md shadow-lg hover:shadow-xl cursor-pointer z-10" onClick={handleAddNode}>
            <Plus className="w-6 h-6 text-gray-600"/>
        </div>

            <div className="flex-1 flex flex-col" style={{ width: '100%', height: '100%' }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                        {workflowData?.homeProject && (
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link
                                                href={`/projects/${workflowData.homeProject.id}`}
                                                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
                                            >
                                                {getProjectIcon(workflowData.homeProject)}
                                                {workflowData.homeProject.type === 'personal'
                                                    ? 'Personal'
                                                    : workflowData.homeProject.name
                                                }
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
                        )}

                        {workflowData?.tags && workflowData.tags.length > 0 && (
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
                        {workflowData && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {workflowData.active ? 'Active' : 'Inactive'}
                                </span>
                                <Switch
                                    checked={workflowData.active}
                                    onCheckedChange={handleToggleActive}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                Share
                            </Button>
                            <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Link
                                href="https://github.com/IkramBagban/n8n"
                                target="_blank"
                                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                            >
                                <Github className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

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

                <div className="flex-1">
                    <ReactFlow
                        onNodeDoubleClick={handleNodeDoubleClick}
                        nodes={nodesWithExecutionStatus}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>
            </div>
            <div className='absolute bottom-10 left-30 w-[70%] flex justify-center items-center'>
                <Button
                    className='bg-red-500 hover:bg-red-600 cursor-pointer disabled:opacity-50'
                    onClick={handleExecuteWorkflow}
                    disabled={isExecuting}
                >
                    {isExecuting ? 'Executing...' : 'Execute Workflow'}
                </Button>
            </div>

            <WorkflowSidebar
                isOpen={isSidebarOpen}
                mode={sidebarMode}
                searchQuery={searchQuery}
                onClose={() => setIsSidebarOpen(false)}
                onSearchChange={setSearchQuery}
                onNodeSelect={handleNodeSelect}
                onModeChange={setSidebarMode}
            />

            <NodeConfigModal
                projectId={workflowData?.homeProject?.id || ''}
                node={selectedNode}
                isOpen={isNodeModalOpen}
                onClose={handleNodeModalClose}
                onSave={handleNodeSave}
            />
        </div>
    );
}