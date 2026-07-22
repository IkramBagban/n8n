'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
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
    Plus,
    Edit2,
    Check,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useWorkflowEditor } from '@/hooks/useWorkflowEditor';
import { WorkflowSidebar, type NodeItem } from '@/components/workflow-sidebar';
import { NodeConfigModal } from '@/components/node-config-modal';
import { ExecutionOutputPanel } from '@/components/execution-output-panel';
import { nodeTypes } from '@/utils/nodes-types';
import { Node } from '@/lib/types';
import { useWorkflowCtx } from '@/store/workflow/workflow-context';
import { DeletableEdge } from '@/components/custom-edges/DeletableEdge';

interface ExecutionMessage {
    nodeId?: string;
    nodeName?: string;
    executionId: string;
    workflowId?: string;
    status: string;
    message?: string;
    nodeStatus?: 'executing' | 'success' | 'failed';
    response?: Record<string, unknown>;
    json?: Record<string, unknown>
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

interface NodePropertyWithDefault {
    name: string;
    default?: unknown;
}

interface WorkflowSnapshot {
    name: string;
    active: boolean;
    tags: string[];
    projectId?: string;
    nodes: unknown[];
    edges: unknown[];
}

const normalizeNodeForSnapshot = (node: Node): unknown => {
    const normalizedNode = { ...node } as Record<string, unknown>;
    delete normalizedNode.selected;
    delete normalizedNode.dragging;
    delete normalizedNode.measured;
    delete normalizedNode.searchNode;
    delete normalizedNode.positionAbsolute;

    return normalizedNode;
};

const normalizeEdgeForSnapshot = (edge: Edge): unknown => {
    const normalizedEdge = { ...edge } as Record<string, unknown>;
    delete normalizedEdge.selected;

    return normalizedEdge;
};

const createSnapshotString = (
    nodes: Node[],
    edges: Edge[],
    workflowData: { name?: string; active?: boolean; tags?: string[]; projectId?: string } | null,
    fallbackProjectId?: string
): string => {
    const snapshot: WorkflowSnapshot = {
        name: workflowData?.name || 'New Workflow',
        active: workflowData?.active || false,
        tags: workflowData?.tags || [],
        projectId: workflowData?.projectId || fallbackProjectId,
        nodes: nodes.map(normalizeNodeForSnapshot),
        edges: edges.map(normalizeEdgeForSnapshot),
    };

    return JSON.stringify(snapshot);
};

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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<ExecutionMessage[]>([]);
    const [nodeExecutionStates, setNodeExecutionStates] = useState<NodeExecutionState>({});
    const [isExecuting, setIsExecuting] = useState(false);
    const [isEditingWorkflowName, setIsEditingWorkflowName] = useState(false);
    const [tempWorkflowName, setTempWorkflowName] = useState('');
    const [isOutputPanelOpen, setIsOutputPanelOpen] = useState(false);
    const [executionOutput, setExecutionOutput] = useState<unknown>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const savedSnapshotRef = useRef<string | null>(null);

    // Reset workflow name editing state when workflowData changes
    useEffect(() => {
        setIsEditingWorkflowName(false);
        setTempWorkflowName('');
    }, [workflowData?.id]);

    const workflowCtx = useWorkflowCtx()

    const currentSnapshot = useMemo(
        () => createSnapshotString(nodes, edges, workflowData, projectId),
        [nodes, edges, workflowData, projectId]
    );

    useEffect(() => {
        savedSnapshotRef.current = null;
        setHasUnsavedChanges(false);
    }, [workflowData?.id]);

    useEffect(() => {
        if (isLoading || !workflowData) return;

        if (!savedSnapshotRef.current) {
            if (!workflowData.id && (nodes.length > 0 || edges.length > 0)) {
                setHasUnsavedChanges(true);
                return;
            }

            savedSnapshotRef.current = currentSnapshot;
            setHasUnsavedChanges(false);
            return;
        }

        setHasUnsavedChanges(savedSnapshotRef.current !== currentSnapshot);
    }, [isLoading, workflowData, currentSnapshot, nodes.length, edges.length]);

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

    const handleDeleteEdge = useCallback((edgeId: string) => {
        onEdgesChange([{ type: 'remove', id: edgeId }]);
    }, [onEdgesChange]);

    const handleDeleteNode = useCallback((nodeId: string) => {
        onNodesChange([{ type: 'remove', id: nodeId }]);
    }, [onNodesChange]);

    const edgesWithDeleteHandler = useMemo(() => {
        return edges.map(edge => ({
            ...edge,
            type: 'deletable',
            data: {
                ...edge.data,
                onDelete: handleDeleteEdge
            }
        }));
    }, [edges, handleDeleteEdge]);

    // Prepare nodes with delete handler
    const nodesWithDeleteHandler = useMemo(() => {
        return nodesWithExecutionStatus.map(node => ({
            ...node,
            data: {
                ...node.data,
                onDelete: handleDeleteNode
            }
        }));
    }, [nodesWithExecutionStatus, handleDeleteNode]);

    // Define edge types
    const edgeTypes = useMemo(() => ({
        deletable: DeletableEdge,
    }), []);


    const isValidConnection = useCallback((connection: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) => {
        const sourceNode = nodes.find(node => node.id === connection.source);
        const targetNode = nodes.find(node => node.id === connection.target);

        if (!sourceNode || !targetNode) {
            toast.error('Invalid connection: Source or target node not found');
            return false;
        }

        // Agent to Model connections (bottom handles)
        if (sourceNode.type === 'agent' && connection.sourceHandle) {
            if (['chat-model', 'memory', 'tool'].includes(connection.sourceHandle)) {
                // Must connect to appropriate node type
                if (connection.sourceHandle === 'chat-model' && targetNode.type !== 'model') {
                    toast.error('Chat Model handle can only connect to Model nodes');
                    return false;
                }
                // Only allow one connection per handle
                const existingConnection = edges.find(
                    edge => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle
                );
                if (existingConnection) {
                    toast.error(`This ${connection.sourceHandle} handle already has a connection`);
                    return false;
                }
            }
        }

        // Model to Agent connections (top handle to bottom handle)
        if (targetNode.type === 'agent' && connection.targetHandle) {
            if (['chat-model', 'memory', 'tool'].includes(connection.targetHandle)) {
                // Model should only connect to one agent
                const existingConnection = edges.find(edge => edge.source === connection.source);
                if (existingConnection) {
                    toast.error('This model node can only connect to one agent');
                    return false;
                }
            }
        }

        return true;
    }, [nodes, edges]);

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

            workflowCtx.setNodes(updatedNodes);

            // // Show success toast for node configuration save
            // toast.success(`Node "${updatedNode.data.label || updatedNode.name}" configuration saved!`, {
            //     duration: 3000,
            // });

            return updatedNodes;
        });
    };

    const handleAddNode = () => {
        setIsSidebarOpen(true);
    };

    const handleNodeSelect = (nodeItem: NodeItem) => {
        // Determine node type based on group or category
        let nodeType: string;
        if (nodeItem.group?.includes('trigger') || nodeItem.category === 'triggers') {
            nodeType = 'trigger';
        } else if (nodeItem.group?.includes('ai') || nodeItem.name === 'agent') {
            nodeType = 'agent';
        } else if (nodeItem.group?.includes('model')) {
            nodeType = 'model';
        } else {
            nodeType = 'action';
        }

        const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const parameters: Record<string, unknown> = {};
        
        // Initialize default parameters based on node properties
        if (nodeItem.properties) {
            Object.values(nodeItem.properties).forEach((prop) => {
                const typedProp = prop as NodePropertyWithDefault;
                if (typedProp.default !== undefined) {
                    parameters[typedProp.name] = typedProp.default;
                }
            });
        }

        // Special handling for webhook node path
        if (nodeItem.name === 'webhook') {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const uuid = crypto.randomUUID();
            parameters['path'] = `${origin}/api/rest/workflows/webhook/${uuid}`;
        }

        const newNode = {
            id: nodeId,
            position: { x: Math.random() * 20, y: Math.random() * 5 },
            name: nodeItem.name,
            description: nodeItem.description,
            type: nodeType,
            parameters: parameters,
            data: {
                label: nodeItem.displayName || nodeItem.name,
                nodeType: nodeItem.id,
                category: nodeItem.category || nodeItem.group?.[0] || 'default',
                credentials: nodeItem.credentials, // this tells which credential we want.
                properties: nodeItem.properties
            },
        };

        console.log("new node", newNode);
        workflowCtx.addNode(newNode);

        setNodes((currentNodes) => [...currentNodes, newNode]);
        setIsSidebarOpen(false);
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            await saveWorkflow();
            savedSnapshotRef.current = currentSnapshot;
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("Error saving workflow:", error);
            toast.error('Error saving workflow. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecuteWorkflow = async () => {

        setNodeExecutionStates({});
        setExecutionLogs([]);
        setIsExecuting(true);

        toast.loading('Starting workflow execution...', {
            id: 'workflow-execution',
            duration: 2000,
        });

        const eventSource = new EventSource("/api/rest/workflows/execute?workflowId=" + workflowId);

        eventSource.onopen = (event) => {
            console.log("Connection opened:", event);
            toast.success('Workflow execution started', {
                id: 'workflow-execution',
            });
        }

        eventSource.onmessage = (event) => {
            const parsedData: ExecutionMessage = JSON.parse(event.data);

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

                // Show toast for node failures
                if (parsedData.nodeStatus === 'failed') {
                    let errorMessage = 'Unknown error';
                    const responseError = parsedData.response?.['error'];
                    const responseMessage = parsedData.response?.['message'];

                    // Extract error message from various possible locations
                    if (parsedData.message) {
                        errorMessage = parsedData.message;
                    } else if (responseError !== undefined) {
                        errorMessage = typeof responseError === 'string'
                            ? responseError
                            : JSON.stringify(responseError);
                    } else if (typeof responseMessage === 'string') {
                        errorMessage = responseMessage;
                    }

                    toast.error(
                        `Node "${parsedData.nodeName || parsedData.nodeId}" failed:\n${errorMessage}`,
                        {
                            duration: 8000,
                            style: {
                                maxWidth: '500px',
                                whiteSpace: 'pre-line',
                            },
                        }
                    );
                }
            }

            // Check if workflow execution finished
            if (parsedData.status === "Success") {
                console.log("Workflow execution completed successfully", executionLogs);
                setIsExecuting(false);
                eventSource.close();
                workflowCtx.setJsonOutput(parsedData.json);

                setExecutionOutput(parsedData.json);
                // setIsOutputPanelOpen(true);

                toast.success('Workflow executed successfully!', {
                    duration: 4000,
                });
            } else if (parsedData.status === "Failed") {
                console.log("Workflow execution failed", executionLogs);

                setIsExecuting(false);
                eventSource.close();
                workflowCtx.setJsonOutput(parsedData.json);

                // Only show workflow failure toast if we didn't just show a node failure toast
                if (parsedData.nodeStatus !== 'failed') {
                    let errorMessage = 'Unknown error occurred';
                    const responseError = parsedData.response?.['error'];
                    if (parsedData.message) {
                        errorMessage = parsedData.message;
                    } else if (responseError !== undefined) {
                        errorMessage = typeof responseError === 'string'
                            ? responseError
                            : JSON.stringify(responseError);
                    }

                    toast.error(
                        `Workflow execution failed:\n${errorMessage}`,
                        {
                            duration: 8000,
                            style: {
                                maxWidth: '500px',
                                whiteSpace: 'pre-line',
                            },
                        }
                    );
                }
            }
        }

        eventSource.onerror = (error) => {
            console.error("Error occurred:", error);
            setIsExecuting(false);
            eventSource.close();
            toast.error('Workflow execution failed due to connection error', {
                duration: 5000,
            });
        }
    }

    const handleStartEditingWorkflowName = () => {
        if (workflowData?.name) {
            setTempWorkflowName(workflowData.name);
            setIsEditingWorkflowName(true);
        }
    };

    const handleSaveWorkflowName = () => {
        if (!tempWorkflowName.trim() || !workflowData) return;

        updateWorkflowData({ name: tempWorkflowName.trim() });
        setIsEditingWorkflowName(false);
    };

    const handleCancelEditingWorkflowName = () => {
        setIsEditingWorkflowName(false);
        setTempWorkflowName('');
    };

    const handleWorkflowNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveWorkflowName();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEditingWorkflowName();
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
                <Plus className="w-6 h-6 text-gray-600" />
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
                                        <div className="flex items-center group">
                                            {isEditingWorkflowName ? (
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        value={tempWorkflowName}
                                                        onChange={(e) => setTempWorkflowName(e.target.value)}
                                                        onKeyDown={handleWorkflowNameKeyDown}
                                                        className="h-6 text-sm font-medium text-gray-900 border-none shadow-none p-0 bg-transparent focus-visible:ring-1 focus-visible:ring-blue-500"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleSaveWorkflowName}
                                                        className="h-6 w-6 p-0 hover:bg-green-100"
                                                    >
                                                        <Check className="h-3 w-3 text-green-600" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleCancelEditingWorkflowName}
                                                        className="h-6 w-6 p-0 hover:bg-red-100"
                                                    >
                                                        <X className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <BreadcrumbPage className="font-medium text-gray-900">
                                                        {workflowData.name}
                                                    </BreadcrumbPage>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleStartEditingWorkflowName}
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                                                    >
                                                        <Edit2 className="h-3 w-3 text-gray-500" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
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
                        {/* {workflowData && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {workflowData.active ? 'Active' : 'Inactive'}
                                </span>
                                <Switch
                                    checked={workflowData.active}
                                    onCheckedChange={handleToggleActive}
                                />
                            </div>
                        )} */}

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsOutputPanelOpen(true)}
                                disabled={!executionOutput}
                            >
                                Output
                            </Button>
                            {/* <Button variant="outline" size="sm">
                                Share
                            </Button> */}
                            <Button
                                size="sm"
                                className={hasUnsavedChanges
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-200 text-gray-500'}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Link
                                href="https://github.com/IkramBagban/Nodeflow"
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
                        {/* <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-not-allowed" disabled>
                            Executions
                        </button>
                        <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-not-allowed" disabled>
                            Evaluations
                        </button> */}
                    </div>
                </div>

                <div className="flex-1 relative">
                    <ReactFlow
                        onNodeDoubleClick={handleNodeDoubleClick}
                        nodes={nodesWithDeleteHandler}
                        edges={edgesWithDeleteHandler}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        isValidConnection={isValidConnection}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>

                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
                        <Button
                            className="bg-red-500 hover:bg-red-600 cursor-pointer disabled:opacity-50 px-6 py-2"
                            onClick={handleExecuteWorkflow}
                            disabled={isExecuting}
                        >
                            {isExecuting ? 'Executing...' : 'Execute Workflow'}
                        </Button>
                        <p className="text-xs whitespace-nowrap bg-black/50 p-1 rounded-md text-white">Save workflow before executing</p>
                    </div>
                </div>
            </div>

            <WorkflowSidebar
                isOpen={isSidebarOpen}
                searchQuery={searchQuery}
                onClose={() => setIsSidebarOpen(false)}
                onSearchChange={setSearchQuery}
                onNodeSelect={handleNodeSelect}
            />

            <NodeConfigModal
                projectId={workflowData?.homeProject?.id || ''}
                node={selectedNode}
                isOpen={isNodeModalOpen}
                onClose={handleNodeModalClose}
                onSave={handleNodeSave}
            />

            <ExecutionOutputPanel
                isOpen={isOutputPanelOpen}
                onClose={() => setIsOutputPanelOpen(false)}
                executionData={executionOutput}
                nodeTitle={selectedNode?.data?.name || 'Execution Result'}
            />
        </div>
    );
}