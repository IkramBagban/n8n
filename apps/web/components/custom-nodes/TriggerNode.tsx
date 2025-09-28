"use client"

import { Handle, Position } from "@xyflow/react";
import { NodeExecutionIndicator } from "@/components/ui/node-spinner";
import { NodeIcon, INodeIcon } from "@/components/ui/node-icon";
import { getNodeIcon } from "@/utils/node-registry";

interface TriggerNodeData {
    label: string;
    executionStatus?: 'idle' | 'executing' | 'success' | 'failed';
    nodeType?: string;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
}

interface TriggerNodeProps {
    data: TriggerNodeData;
}

export function TriggerNode({ data }: TriggerNodeProps) {
  const executionStatus = data.executionStatus || 'idle';
  
  console.log('TriggerNode data:', data);
  
  const getTriggerNodeIcon = (): string | INodeIcon => {
    console.log('TriggerNode nodeType:', data.nodeType);
    
    if (data.nodeType) {
      const registryIcon = getNodeIcon(data.nodeType);
      console.log('TriggerNode registryIcon for', data.nodeType, ':', registryIcon);
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
    <div className="trigger-node relative flex justify-center items-center border border-black/50  rounded-l-3xl bg-white shadow-sm w-12 h-12">
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
      
      <div className="absolute -bottom-3 left-1 h-3 rounded-full  border-white text-[.5rem] w-[10rem]">
        {data?.label[0]?.toUpperCase() + data?.label.slice(1)}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}