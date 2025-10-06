"use client"

import { Handle, Position } from "@xyflow/react";
import { NodeExecutionIndicator } from "@/components/ui/node-spinner";
import { NodeDeleteButton } from "@/components/ui/node-delete-button";

interface ModelNodeData {
    label: string;
    executionStatus?: 'idle' | 'executing' | 'success' | 'failed';
    nodeType?: string;
    onDelete?: (nodeId: string) => void;
    [key: string]: unknown;
}

interface ModelNodeProps {
    data: ModelNodeData;
    id: string;
}
export function ModelNode({ data, id }: ModelNodeProps) {
    const executionStatus = data.executionStatus || 'idle';

    const getModelIcon = () => {
        const nodeType = data.nodeType || '';
        const label = (data.label || '').toLowerCase();

        if (nodeType.includes('googlegemini') || nodeType.includes('google') || label.includes('gemini') || label.includes('google')) {
            return (
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            );
        }

        if (nodeType.includes('openai') || nodeType.includes('gpt') || label.includes('openai') || label.includes('gpt')) {
            return (
                <span className="text-white text-sm font-bold">AI</span>
            );
        }

        if (nodeType.includes('claude') || nodeType.includes('anthropic') || label.includes('claude')) {
            return (
                <span className="text-white text-sm font-bold">C</span>
            );
        }

        return (
            <span className="text-white text-sm font-bold">M</span>
        );
    };

    const getBackgroundColor = () => {
        const nodeType = data.nodeType || '';
        const label = (data.label || '').toLowerCase();

            if (nodeType.includes('googlegemini') || nodeType.includes('google') || label.includes('gemini') || label.includes('google')) {
            return 'bg-white border-1 border-black/50';
        }

            if (nodeType.includes('openai') || nodeType.includes('gpt') || label.includes('openai') || label.includes('gpt')) {
            return 'bg-black';
        }

            if (nodeType.includes('claude') || nodeType.includes('anthropic') || label.includes('claude')) {
            return 'bg-orange-500';
        }

            return 'bg-blue-500';
    };

    return (
        <div className="model-node group relative flex justify-center items-center border-black/50">
            {executionStatus !== 'idle' && (
                <div className="absolute -top-2 -right-2 z-10">
                    <NodeExecutionIndicator status={executionStatus} size="sm" />
                </div>
            )}

            <NodeDeleteButton nodeId={id} onDelete={data.onDelete} />

            <div className={`relative flex justify-center items-center rounded-full shadow-sm w-12 h-12 ${getBackgroundColor()}`}>
                {getModelIcon()}
            </div>

            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="text-[.5rem] text-gray-700 text-center px-2 py-1">
                    {data?.label || 'Model'}
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-gray-600 border-2 border-white !top-[-6px]"
            />
        </div>
    );
}