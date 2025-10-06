"use client";

import { Handle, Position } from "@xyflow/react";
import { NodeExecutionIndicator } from "@/components/ui/node-spinner";
import { NodeIcon, INodeIcon } from "@/components/ui/node-icon";
import { getNodeIcon } from "@/utils/node-registry";

interface AgentNodeData {
    label: string;
    executionStatus?: "idle" | "executing" | "success" | "failed";
    isSelected?: boolean;
    itemCount?: number;
    nodeType?: string;
}

interface AgentNodeProps {
    data: AgentNodeData;
    id: string;
}

export function AgentNode({ data }: AgentNodeProps) {
    const executionStatus = data.executionStatus || "idle";
    const isSelected = data.isSelected || false;

    const getAgentNodeIcon = (): string | INodeIcon => {
        if (data.nodeType) {
            const registryIcon = getNodeIcon(data.nodeType);
            if (registryIcon) return registryIcon;
        }
        
        // Default Agent icon
        return { type: 'lucide' as const, value: 'Bot', color: 'purple' };
    };

    return (
        <div className={`agent-node relative flex justify-center items-center border-1 rounded-md bg-white shadow-sm w-35 h-12 ${isSelected ? 'border-green-400' : 'border-black/50'
            }`}>
            <div className="flex items-center gap-2">
                <NodeIcon 
                    icon={getAgentNodeIcon()} 
                    size="md" 
                    className="text-current"
                />
                <span className="font-medium">AI Agent</span>
            </div>

            {/* <div className="absolute -top-2 -right-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-300">
                {itemCount} item
                <Plus className="w-3 h-3 ml-1 inline" />
            </div> */}

            {executionStatus !== "idle" && (
                <div className="absolute -top-3 -left-3 z-10">
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

            {/* <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <span className="text-[.3rem] text-gray-700">

                    Memory
                </span>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="memory"
                    className="w-3 h-3 bg-blue-400 border-blue-500"
                />
            </div>

            <div className="absolute -bottom-4 right-1/4">
                <span className="text-[.3rem] text-gray-700">

                    Tool
                </span>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="tool"
                    className="w-3 h-3 bg-orange-400 border-orange-500"
                />
            </div> */}
        </div>
    );
}