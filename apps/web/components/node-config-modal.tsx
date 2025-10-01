"use client"

import { useEffect, useState, useCallback } from 'react'
import { X, ExternalLink, Settings, BookOpen } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Node } from "@/lib/types"
import { useWorkflowCtx } from '@/store/workflow/workflow-context'
import { getNodeCredentials } from '@/actions/credentials'
import { CredentialsSection } from './credentials-section'
import { PropertyRenderer } from './property-renderer'
import { CredentialConfigModal } from './credential-config-modal'
import { availableCredentials } from '@/utils/credentials-registry'
import { NodeJsonOutput } from './node-json-output'

interface NodeConfigModalProps {
    node: Node | null
    isOpen: boolean
    onClose: () => void
    onSave: (nodeData: Node) => void
    projectId: string | null
}


interface CredentialRecord {
    id: string;
    name: string;
    type: string;
    data: unknown;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface NodeProperty {
    name: string;
    displayName: string;
    type: string;
    default?: string | number | boolean;
    required?: boolean;
    placeholder?: string;
    description?: string;
    [key: string]: unknown;
}




export function NodeConfigModal({ node, isOpen, onClose, onSave, projectId }: NodeConfigModalProps) {
    const [nodeData, setNodeData] = useState<Node | null>(node)
    const [activeTab, setActiveTab] = useState('parameters')
    const [credentials, setCredentials] = useState<CredentialRecord[]>([])
    const [showCredentialModal, setShowCredentialModal] = useState(false)
    const [selectedCredentialType, setSelectedCredentialType] = useState<string | null>(null)


    const workflowCtx = useWorkflowCtx();
    const nodeOutput = workflowCtx.getJsonOutputById(isOpen ? node.id : null);
    console.log("nodeOutput ---> ", nodeOutput)
    const fetchCredentials = useCallback(async () => {
        console.log("in get credentials", { nodeData, node })
        if (!nodeData?.data?.credentials || nodeData?.data?.credentials?.length === 0) {
            console.log("in")
            return
        }

        const creds = await getNodeCredentials(nodeData?.data?.credentials || [], projectId);
        console.log("credentials", creds)
        setCredentials(creds);
    }, [nodeData, node, projectId])


    const handleParameterChange = (key: string, value: string | number | boolean) => {
        if (!nodeData) return
        workflowCtx.nodeParameterChangeHandler(key, value);
        setNodeData((prev: Node | null) => {
            if (!prev) return prev
            return {
                ...prev,
                parameters: {
                    ...prev.parameters,
                    [key]: value
                }
            }
        })
    }

    const handleDataChange = (key: string, value: string | number | boolean) => {
        if (!nodeData) return

        setNodeData((prev: Node | null) => {
            if (!prev) return prev

            if (key.includes('.')) {
                const [parentKey, childKey] = key.split('.')
                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        [parentKey]: {
                            ...prev.data?.[parentKey],
                            [childKey]: value
                        }
                    }
                }
            }

            return {
                ...prev,
                data: {
                    ...prev.data,
                    [key]: value
                }
            }
        })
    }

    useEffect(() => {
        setNodeData(node)
    }, [node])

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials, isOpen])

    if (!node) return null




    const handleCredentialChange = (credentialType: string, credentialId: string) => {
        setNodeData((prev: Node | null) => {
            if (!prev) return prev

            return {
                ...prev,
                credentialId: credentialId
            }
        })
    }

    const handleCreateCredential = (credentialType: string) => {
        console.log("Create new credential for", credentialType)
        setSelectedCredentialType(credentialType)
        setShowCredentialModal(true)
    }

    const handleCredentialModalClose = () => {
        setShowCredentialModal(false)
        setSelectedCredentialType(null)
        // Refresh credentials after closing the modal
        fetchCredentials()
    }

    const renderProperty = (property: unknown) => {
        if (!property || typeof property !== 'object') return null

        const prop = property as NodeProperty
        const currentValue = workflowCtx.getSelectedNode()?.parameters[prop?.name] || prop.default || ''

        return (
            <PropertyRenderer
                property={prop}
                value={currentValue}
                onChange={(value) => handleParameterChange(prop.name, value)}
            />
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="!max-w-none !w-[65vw] !h-[90vh] p-0 overflow-hidden flex flex-col"
                showCloseButton={false}
            >
                <DialogHeader className="flex flex-row items-center justify-between p-6 border-b bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 text-lg">🪝</span>
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">
                                {nodeData?.data?.label || nodeData?.name || 'Node Configuration'}
                            </DialogTitle>

                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </DialogHeader>

                <div className="flex flex-1 h-full min-h-0">
                    {/* <div className="w-2/6 border-r flex flex-col bg-gray-50">
                        <div className="p-6 border-b bg-white">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Test Webhook
                            </h3>
                            <Button className="bg-red-500 hover:bg-red-600 text-white w-full mb-4">
                                Listen for test event
                            </Button>
                            <p className="text-sm text-gray-600">
                                Click the button above to start listening for webhook events.
                                Once you receive a test event, you will see the data here.
                            </p>
                        </div>

                        <div className="p-4 border-b">
                            <button className="flex items-center justify-between w-full text-left">
                                <span className="text-sm text-gray-700">When will this node trigger my flow?</span>
                                <span className="text-gray-400">▼</span>
                            </button>
                        </div>

                        <div className="flex-1 p-4">
                            <div className="text-center text-gray-500 mt-8">
                                <p className="text-sm">Logs</p>
                            </div>
                        </div>
                    </div> */}

                    <div className="flex-1 flex flex-col min-h-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <TabsList className="grid w-[50%] grid-cols-2 mx-6 mt-6 mb-0 flex-shrink-0" >
                                <TabsTrigger value="parameters" className="flex items-center gap-2" >
                                    <Settings className="w-4 h-4" />
                                    Parameters
                                </TabsTrigger>
                                <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
                            </TabsList>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-hidden min-h-0">
                                <TabsContent value="parameters" className="h-full m-0">
                                    <div className="h-full overflow-y-auto px-6 py-4">
                                        <div className="space-y-6">
                                            {/* Credentials Section */}
                                            <CredentialsSection
                                                credentials={nodeData?.data?.credentials || []}
                                                availableCredentials={credentials}
                                                credentialId={nodeData?.credentialId || ""}
                                                onCredentialChange={handleCredentialChange}
                                                onCreateCredential={handleCreateCredential}
                                            />

                                            {/* Dynamic Properties */}
                                            {Object.keys(nodeData?.data?.properties || {}).length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-4">Configuration</h4>
                                                    <div className="space-y-6">
                                                        {Object.keys(nodeData?.data.properties || {}).map((key) => {
                                                            // console.log("Key", { key, props: nodeData?.data.properties })
                                                            const property = nodeData?.data.properties[key]

                                                            // Handle notice type differently - no label needed
                                                            if (property.type === 'notice') {
                                                                return (
                                                                    <div key={key}>
                                                                        {renderProperty(property)}
                                                                    </div>
                                                                )
                                                            }

                                                            return (
                                                                <div key={key} className="space-y-3">
                                                                    <label className="text-sm font-medium text-gray-700 block">
                                                                        {property.displayName}
                                                                        {property.required && <span className="text-red-500 ml-1">*</span>}
                                                                    </label>
                                                                    <div className="w-full">
                                                                        {renderProperty(property)}
                                                                    </div>
                                                                    {property.description && (
                                                                        <p className="text-xs text-gray-500 mt-1">{property.description}</p>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="h-4"></div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="settings" className="h-full m-0">
                                    <div className="h-full overflow-y-auto px-6 py-4">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-3">Node Name</label>
                                                <Input
                                                    value={nodeData?.data?.label || nodeData?.name || ''}
                                                    onChange={(e) => handleDataChange('label', e.target.value)}
                                                    placeholder="Enter node name"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-3">Notes</label>
                                                <Textarea
                                                    value={nodeData?.data?.notes || ''}
                                                    onChange={(e) => handleDataChange('notes', e.target.value)}
                                                    placeholder="Add notes about this node..."
                                                    rows={4}
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-3">Node Color</label>
                                                <div className="flex gap-2">
                                                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'].map((color) => (
                                                        <button
                                                            key={color}
                                                            className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400"
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => handleDataChange('color', color)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Add some bottom padding */}
                                            <div className="h-4"></div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="docs" className="h-full">
                                    <div className="h-full overflow-y-auto px-6 py-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <BookOpen className="w-5 h-5 text-gray-600" />
                                                <h3 className="font-semibold">Webhook Node Documentation</h3>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="prose prose-sm max-w-none">
                                                <p>The Webhook node allows you to receive HTTP requests and trigger workflows based on external events.</p>

                                                <h4>Key Features</h4>
                                                <ul>
                                                    <li>Listen for HTTP requests (GET, POST, PUT, DELETE, etc.)</li>
                                                    <li>Handle different content types (JSON, form data, etc.)</li>
                                                    <li>Configure custom response behavior</li>
                                                    <li>Extract data from headers, query parameters, and body</li>
                                                </ul>

                                                <h4>Configuration</h4>
                                                <ul>
                                                    <li><strong>HTTP Method:</strong> Choose which HTTP methods to accept</li>
                                                    <li><strong>Path:</strong> Set a custom path for the webhook URL</li>
                                                    <li><strong>Authentication:</strong> Configure security if needed</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    <div className="w-2/5 border-r flex flex-col bg-gray-50">
                        <NodeJsonOutput output={nodeOutput} />
                    </div>
                </div>

                <div className="border-t p-6 bg-gray-50 flex items-center justify-end">
                    {/* <div className="flex items-center gap-2 text-sm text-gray-600"> */}
                    {/* <span className="text-yellow-600">💡</span>
                        <span>Tip: Use the test button to validate your webhook configuration</span> */}
                    {/* </div> */}
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (nodeData) {
                                    onSave(nodeData)
                                    onClose()
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>

            {selectedCredentialType && (
                <CredentialConfigModal
                    isOpen={showCredentialModal}
                    onClose={handleCredentialModalClose}
                    credentialType={{
                        id: selectedCredentialType,
                        displayName: availableCredentials.find(c => c.name === selectedCredentialType)?.displayName || selectedCredentialType,
                        icon: "🔧",
                        properties: availableCredentials.find(c => c.name === selectedCredentialType)?.properties || []
                    }}
                    projectId={projectId || ''}
                />
            )}
        </Dialog>
    )
}