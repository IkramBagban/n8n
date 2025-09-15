"use client"

import { useState } from 'react'
import { X, ExternalLink, Play, Settings, BookOpen } from 'lucide-react'
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

interface NodeConfigModalProps {
    node: Node | null
    isOpen: boolean
    onClose: () => void
    onSave: (nodeData: Node) => void
}

export function NodeConfigModal({ node, isOpen, onClose, onSave }: NodeConfigModalProps) {
    const [nodeData, setNodeData] = useState<Node | null>(node || null)
    const [activeTab, setActiveTab] = useState('parameters')


    console.log("nodeData", nodeData)
    const handleParameterChange = (key: string, value: string | number | boolean) => {
        if (!nodeData) return

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

    if (!node) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="!max-w-none !w-[90vw] !h-[90vh] p-0 overflow-hidden"
                style={{
                    width: '90vw',
                    height: '90vh',
                    maxWidth: 'none',
                    maxHeight: '90vh'
                }}
                showCloseButton={false}
            >
                <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 text-sm font-medium">🪝</span>
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">
                                {nodeData?.data?.label || nodeData?.name || 'Node Configuration'}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                    Listen for test event
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </DialogHeader>

                <div className="flex flex-1 h-full" style={{ height: 'calc(90vh - 80px)' }}>
                    <div className="w-1/2 border-r flex flex-col" style={{ minWidth: '400px' }}>
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-medium text-gray-900 mb-2">
                                Pull in events from {nodeData?.data?.label || 'Webhook'}
                            </h3>
                            <Button variant="outline" size="sm" className="bg-red-500 text-white hover:bg-red-600">
                                <Play className="w-4 h-4 mr-2" />
                                Listen for test event
                            </Button>
                            <p className="text-sm text-gray-600 mt-3">
                                Once you&apos;ve finished building your workflow, run it without having to click this button by using the production webhook URL.{' '}
                                <span className="text-blue-600 cursor-pointer">More info</span>
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
                    </div>

                    <div className="w-1/2 flex flex-col" style={{ minWidth: '500px' }}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
                                <TabsTrigger value="parameters" className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Parameters
                                </TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-auto min-h-[400px] max-h-[500px]">
                                <TabsContent value="parameters" className="p-4 pt-2">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-red-500">▼</span>
                                                <h4 className="font-medium text-gray-900">Webhook URLs</h4>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={activeTab === 'test' ? 'bg-gray-100' : ''}
                                                    >
                                                        Test URL
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={activeTab === 'production' ? 'bg-gray-100' : ''}
                                                    >
                                                        Production URL
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                                    <Badge variant="secondary" className="bg-gray-600 text-white">GET</Badge>
                                                    <code className="text-sm text-gray-700 flex-1">
                                                        https://krisht231.app.n8n.cloud/webhook-test/5bc3758f-2f29-4dfe-a307-6aeb849a86e4
                                                    </code>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">HTTP Method</label>
                                            <Select defaultValue="GET">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GET">GET</SelectItem>
                                                    <SelectItem value="POST">POST</SelectItem>
                                                    <SelectItem value="PUT">PUT</SelectItem>
                                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Path</label>
                                            <Input defaultValue="5bc3758f-2f29-4dfe-a307-6aeb849a86e4" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Authentication</label>
                                            <Select defaultValue="none">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="basic">Basic Auth</SelectItem>
                                                    <SelectItem value="bearer">Bearer Token</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Respond</label>
                                            <Select defaultValue="immediately">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="immediately">Immediately</SelectItem>
                                                    <SelectItem value="when-last-node">When Last Node Finishes</SelectItem>
                                                    <SelectItem value="using-respond">Using Respond to Webhook Node</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                                                <p className="text-sm text-yellow-800">
                                                    If you are sending back a response, add a &quot;Content-Type&quot; response header with the appropriate value to avoid unexpected behavior
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900">Options</h4>
                                            <div className="text-sm text-gray-600">
                                                No properties
                                            </div>

                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Add option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="raw-body">Raw Body</SelectItem>
                                                    <SelectItem value="response-headers">Response Headers</SelectItem>
                                                    <SelectItem value="response-data">Response Data</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="settings" className="p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Node Name</label>
                                            <Input
                                                value={nodeData?.data?.label || ''}
                                                onChange={(e) => handleParameterChange('label', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Notes</label>
                                            <Textarea
                                                placeholder="Add notes about this node..."
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="docs" className="p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-gray-600" />
                                            <h3 className="font-medium">Documentation</h3>
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="prose prose-sm">
                                            <p>The Webhook node allows you to receive HTTP requests and trigger workflows based on external events.</p>
                                            <h4>Configuration</h4>
                                            <ul>
                                                <li>Set the HTTP method (GET, POST, PUT, DELETE)</li>
                                                <li>Configure authentication if needed</li>
                                                <li>Choose response behavior</li>
                                            </ul>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <div className="border-t p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">OUTPUT</h4>
                                <Button variant="ghost" size="sm">
                                    <span className="w-4 h-4">📝</span>
                                </Button>
                            </div>

                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">Execute this node to view data</p>
                                <p className="text-sm">or <span className="text-red-600 cursor-pointer">set mock data</span></p>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-4">
                                <span className="text-yellow-600">💡</span>
                                <span className="text-sm text-gray-600">I wish this node would...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}