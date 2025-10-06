"use client"

import { Handle, Position } from "@xyflow/react";
import { NodeExecutionIndicator } from "@/components/ui/node-spinner";
import { NodeIcon, INodeIcon } from "@/components/ui/node-icon";
import { getNodeIcon } from "@/utils/node-registry";
import { NodeDeleteButton } from "@/components/ui/node-delete-button";

interface TriggerNodeData {
    label: string;
    executionStatus?: 'idle' | 'executing' | 'success' | 'failed';
    nodeType?: string;
    properties?: Record<string, unknown>;
    onDelete?: (nodeId: string) => void;
    [key: string]: unknown;
}

interface TriggerNodeProps {
    data: TriggerNodeData;
    id: string;
}

export function TriggerNode({ data, id }: TriggerNodeProps) {
  const executionStatus = data.executionStatus || 'idle';
    
  const getTriggerNodeIcon = (): string | INodeIcon => {
    if (data.nodeType) {
      const registryIcon = getNodeIcon(data.nodeType);
      if (registryIcon) return registryIcon;
    }
    
    switch (data.nodeType) {
      case 'manualTrigger':
        return { type: 'file' as const, value: 'manualTrigger.svg' };
      case 'webhook':
        return { type: 'file' as const, value: 'webhook.svg' };
      default:
        return { type: 'lucide' as const, value: 'Zap', color: 'yellow' };
    }
  };
  
  return (
    <div className="trigger-node group relative flex justify-center items-center border border-black/50  rounded-l-3xl bg-white shadow-sm w-12 h-12">
      <NodeIcon 
        icon={getTriggerNodeIcon()} 
        size="md" 
        className="text-current"
      />
      
      {executionStatus !== 'idle' && (
        <div className="absolute -top-2 -right-2 z-10">
          <NodeExecutionIndicator status={executionStatus} size="sm" />
        </div>
      )}

      <NodeDeleteButton nodeId={id} onDelete={data.onDelete} />
      
      <div className="absolute -bottom-3 left-1 h-3 rounded-full  border-white text-[.5rem] w-[10rem]">
        {data?.label[0]?.toUpperCase() + data?.label.slice(1)}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}