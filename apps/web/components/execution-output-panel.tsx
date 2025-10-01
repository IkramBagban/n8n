'use client'

import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExecutionOutputPanelProps {
    isOpen: boolean;
    onClose: () => void;
    executionData: unknown;
    nodeTitle?: string;
}

interface TreeNodeProps {
    label: string;
    value?: unknown;
    level?: number;
    isExpandable?: boolean;
    defaultExpanded?: boolean;
}

const TreeNode = ({ label, value, level = 0, isExpandable = false, defaultExpanded = false }: TreeNodeProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const indentClass = level === 0 ? '' : `ml-${level * 4}`;

    const renderValue = (val: unknown): string => {
        if (val === null) return 'null';
        if (val === undefined) return 'undefined';
        if (typeof val === 'boolean') return val.toString();
        if (typeof val === 'number') return val.toString();
        if (typeof val === 'string') return `"${val}"`;
        if (Array.isArray(val)) return `Array(${val.length})`;
        if (typeof val === 'object') return 'Object';
        return String(val);
    };

    const isObject = (val: unknown): val is Record<string, unknown> => {
        return val !== null && typeof val === 'object' && !Array.isArray(val);
    };

    const isArray = (val: unknown): val is unknown[] => {
        return Array.isArray(val);
    };

    if (isExpandable && (isObject(value) || isArray(value))) {
        return (
            <div className={`${indentClass}`}>
                <div 
                    className="flex items-center gap-1 py-1 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-xs text-gray-500 ml-1">
                        {isArray(value) ? `Array(${value.length})` : 'Object'}
                    </span>
                </div>
                {isExpanded && (
                    <div className="ml-4">
                        {isArray(value) ? (
                            value.map((item: unknown, index: number) => (
                                <TreeNode
                                    key={index}
                                    label={`[${index}]`}
                                    value={item}
                                    level={level + 1}
                                    isExpandable={typeof item === 'object' && item !== null}
                                />
                            ))
                        ) : (
                            Object.entries(value).map(([key, val]) => (
                                <TreeNode
                                    key={key}
                                    label={key}
                                    value={val}
                                    level={level + 1}
                                    isExpandable={typeof val === 'object' && val !== null}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`${indentClass} flex items-center gap-2 py-1`}>
            <div className="w-3 h-3" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm text-gray-600">{renderValue(value)}</span>
        </div>
    );
};

export function ExecutionOutputPanel({ isOpen, onClose, executionData, nodeTitle }: ExecutionOutputPanelProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-sm"></div>
                    <span className="text-sm font-medium text-gray-900">OUTPUT</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-blue-500 bg-blue-50">
                    Schema
                </button>
                {/* <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Table
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    JSON
                </button> */}
            </div>

            <div className="flex-1 overflow-auto p-4">
                {executionData ? (
                    <div className="space-y-1">
                        <div className="text-xs text-gray-500 mb-3">
                            {nodeTitle && <span className="font-medium">{nodeTitle} - </span>}
                            1 item
                        </div>
                        
                        <TreeNode
                            label="execution_result"
                            value={executionData}
                            isExpandable={true}
                            defaultExpanded={true}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <p className="text-sm">No execution data available</p>
                            <p className="text-xs mt-1">Execute a workflow to see output</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}