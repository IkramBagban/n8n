'use client'

import { useState } from 'react';
import { ReactFlow } from '@xyflow/react';
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
import { User, Github, Layers } from 'lucide-react';
import Link from 'next/link';
import { useWorkflowEditor } from '@/hooks/useWorkflowEditor';

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
        error,
        onNodesChange,
        onEdgesChange,
        onConnect,
        createNode,
        saveWorkflow,
        updateWorkflowData,
    } = useWorkflowEditor({ workflowId, projectId, isNewWorkflow });

    const [isSaving, setIsSaving] = useState(false);

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

    const getProjectIcon = (project: any) => {
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
        <div style={{ width: '100%', height: '100%' }}>
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

                    <Button variant="outline" size="sm" onClick={createNode}>
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