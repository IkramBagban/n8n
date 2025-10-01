'use client'

import React from 'react';
import {
    X,
    Search,
    ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import { NodeIcon } from '@/components/ui/node-icon';

interface NodeCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    items?: NodeItem[];
}

interface NodeItem {
    id: string;
    name: string;
    description: string;
    displayName: string;
    properties: Record<string, unknown>; // #todo: need to update with proper types
    icon: React.ReactNode;
    type: 'trigger' | 'action';
    group?: string[];
    category: string;
    credentials?: Array<{ name: string; required: boolean }>;
}

interface WorkflowSidebarProps {
    isOpen: boolean;
    mode: 'triggers' | 'actions';
    searchQuery: string;
    onClose: () => void;
    onSearchChange: (query: string) => void;
    onNodeSelect: (node: NodeItem) => void;
    onModeChange: (mode: 'triggers' | 'actions') => void;
}

export function WorkflowSidebar({
    isOpen,
    mode,
    searchQuery,
    onClose,
    onSearchChange,
    onNodeSelect,
    onModeChange,
}: WorkflowSidebarProps) {


    const [availableTriggerNodes, setAvailableTriggerNodes] = React.useState<NodeItem[]>([]);
    const [availableActionNodes, setAvailableActionNodes] = React.useState<NodeItem[]>([]);

    React.useEffect(() => {
        const getTriggerNodes = async () => {
            try {
                const response = await axios.get('/api/rest/available-triggers');
                setAvailableTriggerNodes(response.data);
            } catch (error) {
                console.log('Error fetching trigger nodes:', error);
            }
        };

        const getActionNodes = async () => {
            try {
                const response = await axios.get('/api/rest/available-actions');
                setAvailableActionNodes(response.data);
            } catch (error) {
                console.log('Error fetching action nodes:', error);
            }
        };

        getTriggerNodes();
        getActionNodes();
    }, []);

    const filteredTriggers = availableTriggerNodes.filter(node =>
        node.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredActions = availableActionNodes.filter(node =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );



    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div
                className="fixed inset-0  z-40"
                onClick={onClose}
            />

            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {mode === 'triggers' ? 'What triggers this workflow?' : 'What happens next?'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-3">
                        <p className="text-sm text-gray-600 mb-4">
                            {mode === 'triggers'
                                ? 'A trigger is a step that starts your workflow'
                                : 'Actions are the steps that happen after your workflow starts'
                            }
                        </p>
                        {mode === 'triggers' ? (
                            <>
                                {filteredTriggers?.map((trigger) => (
                                    <div
                                        key={Date.now() + Math.random()}
                                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => onNodeSelect(trigger)}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <NodeIcon 
                                                icon={trigger.icon || { type: 'lucide' as const, value: 'Zap', color: 'yellow' }} 
                                                size="sm" 
                                                className="text-current" 
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-sm">{trigger.displayName || trigger.name}</h3>
                                            <p className="text-xs text-gray-600 mt-1">{trigger.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {filteredActions?.map((action) => (
                                    <div
                                        key={Date.now() + Math.random()}
                                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => onNodeSelect(action)}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <NodeIcon 
                                                icon={action.icon || { type: 'lucide' as const, value: 'Zap', color: 'blue' }} 
                                                size="sm" 
                                                className="text-current" 
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-sm">{action.displayName || action.name}</h3>
                                            <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                ))}
                            </>
                        )}

                        {/* <div className="mt-6 pt-4 border-t border-gray-200">
                            <div
                                className="flex items-center gap-3 p-3 border border-dashed border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors"
                                onClick={() => onModeChange(mode === 'triggers' ? 'actions' : 'triggers')}
                            >
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 text-sm">
                                        {mode === 'triggers' ? 'Add another trigger' : 'Add another action'}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {mode === 'triggers' 
                                            ? 'Triggers start your workflow. Workflows can have multiple triggers.'
                                            : 'Actions perform tasks in your workflow. Chain multiple actions together.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    );
}

export type { NodeItem, NodeCategory, WorkflowSidebarProps };