"use client"

import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";

export function TriggerNode({ data }: any) {
  return (
    <div className="trigger-node relative flex justify-center items-center border border-gray-300 rounded-l-3xl bg-white shadow-sm w-10 h-10">
      <Zap className="w-5 h-5" />
      <div className="absolute -bottom-3 left-0 h-3 rounded-full border border-white text-[.5rem] w-[10rem] border border-gray-300">{data?.label[0]?.toUpperCase() + data?.label.slice(1)}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}