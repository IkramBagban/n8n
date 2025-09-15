'use client'

import { useState } from 'react';
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
    Layers
} from 'lucide-react';
import Link from 'next/link';
import { useWorkflowEditor } from '@/hooks/useWorkflowEditor';
import { WorkflowSidebar, type NodeItem } from '@/components/workflow-sidebar';
import { NodeConfigModal } from '@/components/node-config-modal';
import { nodeTypes } from '@/utils/nodes-types';
import { Node } from '@/lib/types';

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

    console.log("nodes and edges", { nodes, edges })
    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'triggers' | 'nodes'>('triggers');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);

    const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setIsNodeModalOpen(true);
    };

    const handleNodeModalClose = () => {
        setIsNodeModalOpen(false);
        setSelectedNode(null);
    };

    const handleNodeSave = (updatedNode: Node) => {
        setNodes((currentNodes) =>
            currentNodes.map((node) =>
                node.id === updatedNode.id ? updatedNode : node
            )
        );
    };

    const handleAddNode = () => {
        if (nodes.length === 0) {
            setSidebarMode('triggers');
        } else {
            setSidebarMode('nodes');
        }
        setIsSidebarOpen(true);
    };

    const handleNodeSelect = (nodeItem: NodeItem) => {
        console.log("Selected node item:", nodeItem);
        const newNode = {
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            // type: 'default',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            name: nodeItem.name,
            description: nodeItem.description,
            type: "trigger",
            parameters: {},
            data: {
                label: nodeItem.displayName,
                nodeType: nodeItem.id,
                category: nodeItem.category || nodeItem.group[0],   
                properties: nodeItem.properties
            },
        };

        setNodes((currentNodes) => [...currentNodes, newNode]);
        setIsSidebarOpen(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveWorkflow();
            alert('Workflow saved successfully!');
        } catch (error) {
            console.log("Error saving workflow:", error);
            alert('Error saving workflow. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

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
            {/*     <NodeDataOverlay data={{ label: 'Sample Node', nodeType: 'trigger', category: 'AI' }} /> */}

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

                        <Button variant="outline" size="sm" onClick={handleAddNode}>
                            + Add Node
                        </Button>

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
                        nodes={nodes}
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
                node={selectedNode}
                isOpen={isNodeModalOpen}
                onClose={handleNodeModalClose}
                onSave={handleNodeSave}
            />
        </div>
    );
}