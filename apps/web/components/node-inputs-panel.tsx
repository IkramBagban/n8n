"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface NodeInputsPanelProps {
    inputs: Record<string, unknown>
    nodeId?: string
}

const renderKeyValue = (
    key: string, 
    value: unknown, 
    depth: number = 0, 
    nodeId: string = '', 
    pathPrefix: string = '',
    expandedPaths: Record<string, boolean>,
    togglePath: (path: string) => void
) => {
    // Build the current path for this key
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const fullPath = nodeId ? `${nodeId}.${currentPath}` : currentPath;
    const expandKey = `${nodeId}_${currentPath}`;
    const isExpanded = expandedPaths[expandKey] ?? (depth < 2); // Auto-expand first 2 levels

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const objectValue = value as Record<string, unknown>
        const hasChildren = Object.keys(objectValue).length > 0

        return (
            <div key={key} className="mb-2">
                <div
                    className={`flex items-center gap-2 cursor-pointer  p-2 rounded-md`}
                    onClick={() => togglePath(expandKey)}
                >
                    {hasChildren ? (
                        isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                    <span
                        className={`text-sm font-medium text-gray-700 cursor-grab ${depth === 0 ? 'font-semibold text-blue-700' : ''}`}
                        onDragStart={(ev) => {
                            console.log("Dragging object path:", fullPath);
                            ev.dataTransfer.setData("text", `{{ ${fullPath} }}`);
                            ev.dataTransfer.effectAllowed = "copy";
                            ev.stopPropagation();
                        }}
                        draggable
                        title={`Drag to use: {{ ${fullPath} }}`}
                    >
                        {key}
                    </span>
                    {hasChildren && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                            {Object.keys(objectValue).length} {Object.keys(objectValue).length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {isExpanded && hasChildren && (
                    <div className={`ml-6 border-l-2 border-gray-200 pl-4 space-y-1`}>
                        {Object.keys(objectValue).map((subKey) =>
                            renderKeyValue(subKey, objectValue[subKey], depth + 1, nodeId, currentPath, expandedPaths, togglePath)
                        )}
                    </div>
                )}
            </div>
        )
    } else if (Array.isArray(value)) {
        return (
            <div key={key} className="mb-2">
                <div
                    className={`flex items-center gap-2 cursor-pointer  p-2 rounded-md transition-colors`}
                    onClick={() => togglePath(expandKey)}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                    <span
                        className="text-sm font-medium text-gray-700 cursor-grab"
                        onDragStart={(ev) => {
                            console.log("Dragging array path:", fullPath);
                            ev.dataTransfer.setData("text", `{{ ${fullPath} }}`);
                            ev.dataTransfer.effectAllowed = "copy";
                            ev.stopPropagation(); // Prevent triggering the expand/collapse
                        }}
                        draggable
                        title={`Drag to use: {{ ${fullPath} }}`}
                    >
                        {key}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        Array ({value.length} {value.length === 1 ? 'item' : 'items'})
                    </span>
                </div>

                {isExpanded && (
                    <div className="ml-6 border-l-2 border-gray-200 pl-4 space-y-1">
                        {value.map((item, index) =>
                            renderKeyValue(`[${index}]`, item, depth + 1, nodeId, currentPath, expandedPaths, togglePath)
                        )}
                    </div>
                )}
            </div>
        )
    } else {
        return (
            <div key={key} className="flex items-center gap-2 mb-2 p-2 hover:bg-blue-50 rounded-md group transition-colors">
                <div className="w-4 h-4" />
                <span
                    className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0 cursor-grab select-none hover:text-blue-600 hover:bg-blue-100 px-2 py-1 rounded border-2 border-dashed border-transparent hover:border-blue-300 transition-all"
                    onDragStart={(ev) => {
                        console.log("Dragging full path:", fullPath);
                        ev.dataTransfer.setData("text", `{{ ${fullPath} }}`);
                        ev.dataTransfer.effectAllowed = "copy";
                    }}
                    onDragEnd={(ev) => {
                        ev.currentTarget.classList.remove('opacity-50');
                    }}
                    draggable
                    title={`Drag to use: {{ ${fullPath} }}`}
                >
                    {key}:
                </span>
                <span className="text-sm text-gray-600 break-all min-w-0 flex-1">
                    {String(value)}
                </span>
                <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    drag
                </span>
            </div>
        )
    }
}

const NodeInputSection = ({ nodeId, nodeData, isExpanded, onToggle, expandedPaths, togglePath }: {
    nodeId: string
    nodeData: unknown
    isExpanded: boolean
    onToggle: () => void
    expandedPaths: Record<string, boolean>
    togglePath: (path: string) => void
}) => {
    const nodeDataObj = nodeData as Record<string, unknown>
    const hasData = nodeDataObj && Object.keys(nodeDataObj).length > 0

    return (
        <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm">
            <div
                className={`flex items-center gap-3 p-3  cursor-pointer transition-colors`}
                onClick={onToggle}
            >
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                )}

                <div className="flex items-center gap-2">
                    <span className={`font-semibold`}>
                        {nodeId}
                    </span>
                </div>

                {hasData && (
                    <span className="text-xs text-gray-600 bg-white bg-opacity-70 px-2 py-1 rounded-full ml-auto">
                        {Object.keys(nodeDataObj).length} {Object.keys(nodeDataObj).length === 1 ? 'property' : 'properties'}
                    </span>
                )}
            </div>

            {isExpanded && (
                <div className="p-4 bg-white">
                    {hasData ? (
                        <div className="space-y-1">
                            {Object.keys(nodeDataObj).map((key) =>
                                renderKeyValue(key, nodeDataObj[key], 0, nodeId, '', expandedPaths, togglePath)
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <p className="text-sm">No data available for this node</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export function NodeInputsPanel({ inputs, nodeId }: NodeInputsPanelProps) {
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
    const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({})

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: !prev[nodeId]
        }))
    }

    const togglePath = (path: string) => {
        setExpandedPaths(prev => ({
            ...prev,
            [path]: !prev[path]
        }))
    }

    const hasInputs = inputs && Object.keys(inputs).length > 0

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Node Inputs</h3>
                {hasInputs && (
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full ml-auto">
                        {Object.keys(inputs).length} {Object.keys(inputs).length === 1 ? 'input' : 'inputs'}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                {hasInputs ? (
                    <div className="space-y-2">
                        {Object.keys(inputs).map((inputNodeId) => (
                            <NodeInputSection
                                key={inputNodeId}
                                nodeId={inputNodeId}
                                nodeData={inputs[inputNodeId]}
                                isExpanded={expandedNodes[inputNodeId] ?? false}
                                onToggle={() => toggleNode(inputNodeId)}
                                expandedPaths={expandedPaths}
                                togglePath={togglePath}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <h4 className="font-medium text-gray-700 mb-2">No Input Data</h4>
                        <p className="text-sm text-gray-500 max-w-sm">
                            {nodeId
                                ? "This node doesn't have any inputs from previous nodes"
                                : "Select a node to view its input data"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}