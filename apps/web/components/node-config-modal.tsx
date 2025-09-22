"use client"

import { useEffect, useState } from 'react'
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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Node } from "@/lib/types"
import { useWorkflowCtx } from '@/store/workflow/workflow-context'
import { getNodeCredentials } from '@/actions/credentials'

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

export function NodeConfigModal({ node, isOpen, onClose, onSave, projectId }: NodeConfigModalProps) {
    const [nodeData, setNodeData] = useState<Node | null>(node)
    const [activeTab, setActiveTab] = useState('parameters')
    const [credentials, setCredentials] = useState<CredentialRecord[]>([])
    const workflowCtx = useWorkflowCtx();
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

            // Handle nested properties like selectedCredentials.TelegramApi
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
        const fetchCredentials = async () => {
            console.log("in get credentials", { nodeData, node })
            if (!nodeData?.data?.credentials || nodeData?.data?.credentials?.length === 0) {
                console.log("in")
                return <p className="text-sm text-gray-500">No credentials required for this node.</p>
            }

            const creds = await getNodeCredentials(nodeData?.data?.credentials || [], projectId);
            console.log("credentials", creds)
            setCredentials(creds);
        }

        fetchCredentials();

    }, [projectId, nodeData, isOpen, node])

    if (!node) return null



    console.log("CREDEN", credentials)

    const renderCredentials = () => {
        if (!nodeData?.data?.credentials || nodeData?.data?.credentials?.length === 0) {
            return <p className="text-sm text-gray-500">No credentials required for this node.</p>
        }

        return (
            <div className="space-y-4">
                {nodeData?.data?.credentials?.map((credentialType) => {
                    // Find actual credentials that match this type
                    const availableCredentials = credentials.filter((cred) => cred.type === credentialType.name)
                    const selectedCredential = nodeData.data?.selectedCredentials?.[credentialType.name] || ''
                    console.log("nodeData.data",nodeData.data)

                    return (
                        <div key={credentialType.name} className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Credential to connect with
                            </label>
                            <Select
                                value={selectedCredential}
                                onValueChange={(value) => {
                                    if (value === "create-new") {
                                        // Handle create new credential
                                        console.log("Create new credential for", credentialType.name)
                                        return
                                    }
                                    handleDataChange(`selectedCredentials.${credentialType.name}`, value)
                                }}
                            >
                                <SelectTrigger className="w-full h-12 px-3 border border-gray-300 rounded-md">
                                    <SelectValue placeholder={`${credentialType.displayName || credentialType.name} account`} />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                    {availableCredentials.map((credential) => (
                                        <SelectItem key={credential.id} value={credential.id} className="p-3">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                                                    <span className="text-red-600 text-sm">📱</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{credential.name}</div>
                                                    <div className="text-xs text-gray-500">{credentialType.displayName || credentialType.name}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    <div className="border-t my-1"></div>
                                    <SelectItem value="create-new" className="p-3">
                                        <div className="flex items-center gap-3 text-blue-600">
                                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                                <span className="text-blue-600 text-sm">+</span>
                                            </div>
                                            <span className="font-medium">Create new credential</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {availableCredentials.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No {credentialType.displayName || credentialType.name} credentials configured.
                                    <button className="text-blue-600 hover:underline ml-1">
                                        Create one now
                                    </button>
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderProperty = (property) => {
        if (!property) return null

        const currentValue = workflowCtx.getSelectedNode()?.parameters[property?.name] || property.default || ''

        switch (property?.type) {
            case 'callout':
                return (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
                        {property.displayName}
                    </div>

                )
            case 'string':
                return (
                    <Input
                        placeholder={property.placeholder || ''}
                        value={currentValue}
                        onChange={(e) => handleParameterChange(property.name, e.target.value)}
                        className="mt-2"
                    />
                )
            case 'number':
                return (
                    <Input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleParameterChange(property.name, Number(e.target.value))}
                        className="mt-2"
                    />
                )
            case "options":
                return (
                    <Select value={currentValue} onValueChange={(value) => handleParameterChange(property.name, value)}>
                        <SelectTrigger className="mt-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                property.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.name}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                )
            case 'boolean':
                return (
                    <Select value={currentValue.toString()} onValueChange={(value) => handleParameterChange(property.name, value === 'true')}>
                        <SelectTrigger className="mt-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                    </Select>
                )
            case 'textarea':
                return (
                    <Textarea
                        placeholder={property.placeholder || ''}
                        value={currentValue}
                        onChange={(e) => handleParameterChange(property.name, e.target.value)}
                        className="mt-2"
                        rows={property.rows || 3}
                    />
                )
            default:
                return (
                    <Input
                        placeholder={property.placeholder || ''}
                        value={currentValue}
                        onChange={(e) => handleParameterChange(property.name, e.target.value)}
                        className="mt-2"
                    />
                )
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="!max-w-none !w-[50vw] !h-[95vh] p-0 overflow-hidden"
                showCloseButton={false}
            >
                {/* Header */}
                <DialogHeader className="flex flex-row items-center justify-between p-6 border-b bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 text-lg">🪝</span>
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">
                                {nodeData?.data?.label || nodeData?.name || 'Node Configuration'}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                    Webhook Node
                                </Badge>
                            </div>
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

                {/* Main Content */}
                <div className="flex flex-1 h-full">
                    {/* Left Panel - Test Section */}
                    {/* <div className="w-2/5 border-r flex flex-col bg-gray-50">
                        <div className="p-6 border-b bg-white">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Test Webhook
                            </h3>
                            <Button className="bg-red-500 hover:bg-red-600 text-white w-full mb-4">
                                <Play className="w-4 h-4 mr-2" />
                                Listen for test event
                            </Button>
                            <p className="text-sm text-gray-600">
                                Click the button above to start listening for webhook events.
                                Once you receive a test event, you'll see the data here.
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

                    {/* Right Panel - Configuration */}
                    <div className="flex-1 flex flex-col">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="grid w-[50%] grid-cols-2 mx-6 mt-6 mb-0" >
                                <TabsTrigger value="parameters" className="flex items-center gap-2" >
                                    <Settings className="w-4 h-4" />
                                    Parameters
                                </TabsTrigger>
                                <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
                            </TabsList>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-hidden">
                                <TabsContent value="parameters" className="h-full">
                                    <div className="h-full overflow-y-auto px-6 py-4">
                                        <div className="space-y-6">
                                            {/* Dynamic Properties */}
                                            {renderCredentials()}
                                            {Object.keys(nodeData?.data?.properties || {}).length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-4">Configuration</h4>
                                                    <div className="space-y-4">
                                                        {Object.keys(nodeData?.data.properties || {}).map((key) => {
                                                            // console.log("Key", { key, props: nodeData?.data.properties })
                                                            const property = nodeData?.data.properties[key]
                                                            return (
                                                                <div key={key} className="space-y-2">
                                                                    <label className="text-sm font-medium text-gray-700 block">
                                                                        {property.displayName}
                                                                        {property.required && <span className="text-red-500 ml-1">*</span>}
                                                                    </label>
                                                                    {renderProperty(property)}
                                                                    {property.description && (
                                                                        <p className="text-xs text-gray-500">{property.description}</p>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Options */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-4">Additional Options</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                                            Response Mode
                                                        </label>
                                                        <Select defaultValue="responseCode">
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="responseCode">Response Code</SelectItem>
                                                                <SelectItem value="responseData">Response Data</SelectItem>
                                                                <SelectItem value="noResponse">No Response</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="settings" className="h-full">
                                    <div className="h-full overflow-y-auto px-6 py-4">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">Node Name</label>
                                                <Input
                                                    value={nodeData?.data?.label || nodeData?.name || ''}
                                                    onChange={(e) => handleDataChange('label', e.target.value)}
                                                    placeholder="Enter node name"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">Notes</label>
                                                <Textarea
                                                    value={nodeData?.data?.notes || ''}
                                                    onChange={(e) => handleDataChange('notes', e.target.value)}
                                                    placeholder="Add notes about this node..."
                                                    rows={4}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-700 block mb-2">Node Color</label>
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
                </div>

                {/* Footer with Action Buttons */}
                <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-yellow-600">💡</span>
                        <span>Tip: Use the test button to validate your webhook configuration</span>
                    </div>
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
        </Dialog>
    )
}