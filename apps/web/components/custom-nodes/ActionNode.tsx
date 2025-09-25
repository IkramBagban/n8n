"use client"

import { Handle, Position } from "@xyflow/react";
import { Send } from "lucide-react";
import { NodeExecutionIndicator } from "@/components/ui/node-spinner";

interface ActionNodeData {
    label: string;
    executionStatus?: 'idle' | 'executing' | 'success' | 'failed';
    [key: string]: unknown;
}

interface ActionNodeProps {
    data: ActionNodeData;
}

export function ActionNode({ data }: ActionNodeProps) {
    const executionStatus = data.executionStatus || 'idle';
    
    return (
        <div className="action-node relative flex justify-center items-center border border-black/50 rounded-lg bg-white shadow-sm w-12 h-12">
            <Send className="w-5 h-5 text-blue-600" />
            
            {executionStatus !== 'idle' && (
                <div className="absolute -top-2 -right-2 z-10">
                    <NodeExecutionIndicator status={executionStatus} size="sm" />
                </div>
            )}
            
            <div className="absolute -bottom-3 left-2 h-3 rounded-full border-white text-[.5rem] w-[10rem]">
                {data?.label[0]?.toUpperCase() + data?.label.slice(1)}
            </div>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
}