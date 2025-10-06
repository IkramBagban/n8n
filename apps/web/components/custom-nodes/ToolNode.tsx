"use client"

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Calculator, Clock } from "lucide-react";

interface ToolNodeData {
  label?: string;
  name: string;
  type: string;
  description?: string;
}

function ToolNodeComponent({ data, selected }: NodeProps<ToolNodeData>) {
  const getToolIcon = () => {
    if (data.name === "toolCalculator") {
      return <Calculator className="w-5 h-5" />;
    }
    if (data.name === "toolDateTime") {
      return <Clock className="w-5 h-5" />;
    }
    return <span className="text-lg">🛠️</span>;
  };

  const getToolColor = () => {
    if (data.name === "toolCalculator") {
      return "from-emerald-400 to-emerald-600";
    }
    if (data.name === "toolDateTime") {
      return "from-purple-400 to-purple-600";
    }
    return "from-gray-400 to-gray-600";
  };

  return (
    <div
      className={`
        relative min-w-[180px] rounded-xl shadow-lg
        transition-all duration-200 ease-in-out
        ${selected ? "ring-2 ring-blue-500 ring-offset-2 scale-105" : "hover:shadow-xl"}
        bg-gradient-to-br ${getToolColor()}
        text-white
      `}
    >
      {/* Top Handle - connects FROM agent */}
      <Handle
        type="target"
        position={Position.Top}
        id="tool-input"
        className="!w-3 !h-3 !bg-white !border-2 !border-current"
        style={{ top: -6 }}
      />

      {/* Node Content */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            {getToolIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">
              {data.label || data.name}
            </div>
            <div className="text-xs opacity-80">Tool</div>
          </div>
        </div>

        {data.description && (
          <div className="text-xs opacity-90 mt-2 line-clamp-2">
            {data.description}
          </div>
        )}
      </div>

      {/* Tool Badge */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
        <span className="text-xs">🔧</span>
      </div>
    </div>
  );
}

export const ToolNode = memo(ToolNodeComponent);
