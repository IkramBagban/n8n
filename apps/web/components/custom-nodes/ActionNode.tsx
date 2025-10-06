"use client"

import { Handle, Position } from "@xyflow/react";
import { NodeExecutionIndicator } from "@/components/ui/node-spinner";
import { NodeIcon, INodeIcon } from "@/components/ui/node-icon";
import { getNodeIcon } from "@/utils/node-registry";
import { NodeDeleteButton } from "@/components/ui/node-delete-button";

interface ActionNodeData {
    label: string;
    executionStatus?: 'idle' | 'executing' | 'success' | 'failed';
    nodeType?: string;
    properties?: Record<string, unknown>;
    onDelete?: (nodeId: string) => void;
    [key: string]: unknown;
}

interface ActionNodeProps {
    data: ActionNodeData;
    id: string;
}

export function ActionNode({ data, id }: ActionNodeProps) {
    const executionStatus = data.executionStatus || 'idle';
    
    
    const getActionNodeIcon = (): string | INodeIcon => {
        if (data.nodeType) {
            const registryIcon = getNodeIcon(data.nodeType);
            if (registryIcon) return registryIcon;
        }
        
        switch (data.nodeType) {
            case 'telegram':
                return { type: 'file' as const, value: 'telegram.svg' };
            case 'resend':
                return { type: 'url' as const, value: 'https://img.icons8.com/?size=100&id=nyD0PULzXd9Q&format=png&color=000000' };
            case 'agent':
                return { type: 'lucide' as const, value: 'Bot', color: 'purple' };
            default:
                return { type: 'lucide' as const, value: 'Zap', color: 'blue' };
        }
    };

    return (
        <div className="action-node group relative flex justify-center items-center border border-black/50 rounded-lg bg-white shadow-sm w-12 h-12">
            <NodeIcon 
                icon={getActionNodeIcon()} 
                size="md" 
                className="text-current"
            />
            
            {executionStatus !== 'idle' && (
                <div className="absolute -top-2 -right-2 z-10">
                    <NodeExecutionIndicator status={executionStatus} size="sm" />
                </div>
            )}

            <NodeDeleteButton nodeId={id} onDelete={data.onDelete} />
            
            <div className="absolute -bottom-3 left-2 h-3 rounded-full border-white text-[.5rem] w-[10rem]">
                {data?.label[0]?.toUpperCase() + data?.label.slice(1)}
            </div>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
}