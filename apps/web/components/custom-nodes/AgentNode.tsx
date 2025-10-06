"use client";

import { Handle, Position } from "@xyflow/react";
import { NodeExecutionIndicator } from "@/components/ui/node-spinner";
import { NodeIcon, INodeIcon } from "@/components/ui/node-icon";
import { getNodeIcon } from "@/utils/node-registry";
import { NodeDeleteButton } from "@/components/ui/node-delete-button";

interface AgentNodeData {
    label: string;
    executionStatus?: "idle" | "executing" | "success" | "failed";
    isSelected?: boolean;
    itemCount?: number;
    nodeType?: string;
    onDelete?: (nodeId: string) => void;
}

interface AgentNodeProps {
    data: AgentNodeData;
    id: string;
}

export function AgentNode({ data, id }: AgentNodeProps) {
    const executionStatus = data.executionStatus || "idle";
    const isSelected = data.isSelected || false;

    const getAgentNodeIcon = (): string | INodeIcon => {
        if (data.nodeType) {
            const registryIcon = getNodeIcon(data.nodeType);
            if (registryIcon) return registryIcon;
        }

        return { type: 'lucide' as const, value: 'Bot', color: 'purple' };
    };

    return (
        <div className={`agent-node group relative flex justify-center items-center border-1 rounded-md bg-white shadow-sm w-35 h-12 ${isSelected ? 'border-green-400' : 'border-black/50'
            }`}>
            <div className="flex items-center gap-2">
                <NodeIcon
                    icon={getAgentNodeIcon()}
                    size="md"
                    className="text-current"
                />
                <span className="font-medium">AI Agent</span>
            </div>

            <NodeDeleteButton nodeId={id} onDelete={data.onDelete} />

            {executionStatus !== "idle" && (
                <div className="absolute -top-3 -right-1 z-10">
                    <NodeExecutionIndicator status={executionStatus} size="sm" />
                </div>
            )}

            {isSelected && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            <Handle
                type="target"
                position={Position.Left}
                id="input"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="output"
            />


            <div className="absolute -bottom-4 left-15">
                <span className="text-[.4rem] text-gray-700">

                    Chat Model
                </span>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="chat-model"
                    className="w-3 h-3 bg-purple-400 border-purple-500"
                />
            </div>
        </div>
    );
}