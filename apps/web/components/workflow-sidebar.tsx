'use client'

import React from 'react';
import {
    X,
    Search,
    Zap,
    Globe,
    FileText,
    Clock,
    Database,
    Code,
    MessageSquare,
    ChevronRight,
    Plus
} from 'lucide-react';
import axios from 'axios';

interface NodeCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    items: NodeItem[];
}

interface NodeItem {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    type: 'trigger' | 'action';
    group?: string[];
    category: string;
}

interface WorkflowSidebarProps {
    isOpen: boolean;
    mode: 'triggers' | 'nodes';
    searchQuery: string;
    onClose: () => void;
    onSearchChange: (query: string) => void;
    onNodeSelect: (node: NodeItem) => void;
    onModeChange: (mode: 'triggers' | 'nodes') => void;
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
    console.log("availableTriggerNodes:", availableTriggerNodes);
    React.useEffect(() => {

        const getTriggerNodes = async () => {
            try {
                const response = await axios.get('/api/rest/available-triggers');
                console.log("available triggers:", response.data);
                setAvailableTriggerNodes(response.data);
            } catch (error) {
                console.log('Error fetching trigger nodes:', error);
            }
        };

        getTriggerNodes();
    }, []);

    // const triggerNodes: NodeItem[] = [
    //     {
    //         id: 'manual-trigger',
    //         name: 'Trigger manually',
    //         description: 'Runs the flow on clicking a button in n8n',
    //         icon: <Zap className="w-5 h-5" />,
    //         type: 'trigger',
    //         category: 'triggers'
    //     },
    //     {
    //         id: 'schedule-trigger',
    //         name: 'On a schedule',
    //         description: 'Runs the flow every day, hour, or custom interval',
    //         icon: <Clock className="w-5 h-5" />,
    //         type: 'trigger',
    //         category: 'triggers'
    //     },
    //     {
    //         id: 'webhook-trigger',
    //         name: 'On webhook call',
    //         description: 'Runs the flow on receiving an HTTP request',
    //         icon: <Globe className="w-5 h-5" />,
    //         type: 'trigger',
    //         category: 'triggers'
    //     },
    //     {
    //         id: 'form-trigger',
    //         name: 'On form submission',
    //         description: 'Generate webforms in n8n and pass their responses to the workflow',
    //         icon: <FileText className="w-5 h-5" />,
    //         type: 'trigger',
    //         category: 'triggers'
    //     },
    //     {
    //         id: 'chat-trigger',
    //         name: 'On chat message',
    //         description: 'Runs the flow when a user sends a chat message',
    //         icon: <MessageSquare className="w-5 h-5" />,
    //         type: 'trigger',
    //         category: 'triggers'
    //     }
    // ];

    const nodeCategories: NodeCategory[] = [
        {
            id: 'ai',
            name: 'AI',
            description: 'Build autonomous agents, summarize or search documents, etc.',
            icon: <Zap className="w-5 h-5" />,
            items: [
                {
                    id: 'openai',
                    name: 'OpenAI',
                    description: 'Use OpenAI GPT models',
                    icon: <Code className="w-4 h-4" />,
                    type: 'action',
                    category: 'ai'
                }
            ]
        },
        {
            id: 'app-action',
            name: 'Action in an app',
            description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
            icon: <Globe className="w-5 h-5" />,
            items: [
                {
                    id: 'google-sheets',
                    name: 'Google Sheets',
                    description: 'Read and write to Google Sheets',
                    icon: <FileText className="w-4 h-4" />,
                    type: 'action',
                    category: 'app-action'
                }
            ]
        },
        {
            id: 'data-transformation',
            name: 'Data transformation',
            description: 'Manipulate, filter or convert data',
            icon: <Database className="w-5 h-5" />,
            items: [
                {
                    id: 'code',
                    name: 'Code',
                    description: 'Run custom JavaScript code',
                    icon: <Code className="w-4 h-4" />,
                    type: 'action',
                    category: 'data-transformation'
                }
            ]
        }
    ];

    const filteredTriggers = availableTriggerNodes.filter(node =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCategories = nodeCategories.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

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
                    {mode === 'triggers' ? (
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-gray-600 mb-4">
                                A trigger is a step that starts your workflow
                            </p>
                            {filteredTriggers.map((trigger) => (
                                <div
                                    key={trigger.id}
                                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors"
                                    onClick={() => onNodeSelect(trigger)}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        {/* {trigger.icon} */}
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 text-sm">{trigger.name}</h3>
                                        <p className="text-xs text-gray-600 mt-1">{trigger.description}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </div>
                            ))}

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div
                                    className="flex items-center gap-3 p-3 border border-dashed border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors"
                                    onClick={() => onModeChange('triggers')}
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 text-sm">Add another trigger</h3>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Triggers start your workflow. Workflows can have multiple triggers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {filteredCategories.map((category) => (
                                <div key={category.id} className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 cursor-pointer transition-colors">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            {category.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                                            <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export type { NodeItem, NodeCategory, WorkflowSidebarProps };