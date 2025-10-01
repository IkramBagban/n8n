"use client"

import { useState, useEffect } from "react"
import { X, Edit2, Check } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { INodeProperties } from "../../../packages/nodes-base/types"
import { FieldRenderer } from './field-renderer'

interface CredentialConfigModalProps {
    isOpen: boolean
    onClose: () => void
    credentialType: {
        id: string
        displayName: string
        icon: string
        properties: INodeProperties[]
    }
    projectId: string
}

export function CredentialConfigModal({
    isOpen,
    onClose,
    credentialType,
    projectId
}: CredentialConfigModalProps) {
    const [credentialData, setCredentialData] = useState<Record<string, string | number | boolean>>({})
    const [credentialName, setCredentialName] = useState(`${credentialType.displayName} account`)
    const [isSaving, setIsSaving] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempCredentialName, setTempCredentialName] = useState('')

    useEffect(() => {
        if (isOpen) {
            setCredentialName(`${credentialType.displayName} account`)
            setIsEditingName(false)
            setTempCredentialName('')
        }
    }, [isOpen, credentialType.displayName])

    const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
        setCredentialData(prev => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const handleStartEditingName = () => {
        setTempCredentialName(credentialName)
        setIsEditingName(true)
    }

    const handleSaveCredentialName = () => {
        if (tempCredentialName.trim()) {
            setCredentialName(tempCredentialName.trim())
        }
        setIsEditingName(false)
        setTempCredentialName('')
    }

    const handleCancelEditingName = () => {
        setIsEditingName(false)
        setTempCredentialName('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveCredentialName()
        } else if (e.key === 'Escape') {
            handleCancelEditingName()
        }
    }

    const renderField = (property: INodeProperties) => {
        const value = credentialData[property.name] || property.default || ""
        return (
            <FieldRenderer
                property={property}
                value={value}
                onChange={(value) => handleFieldChange(property.name, value)}
            />
        )
    }

    const handleSave = async () => {
        console.log("in handle save")
        setIsSaving(true)
        try {
            const payload = {
                name: credentialName,
                type: credentialType.id,
                data: credentialData,
                projectId
            }

            console.log("Payload", payload)
            const response = await fetch('/api/rest/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save credential')
            }

            const result = await response.json()
            console.log("Credential saved successfully:", result)

            onClose()
        } catch (error) {
            console.error("Error saving credential:", error)
            // TODO: Show error message to user
            alert(error instanceof Error ? error.message : 'Failed to save credential')
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        setCredentialData({})
        setCredentialName(`${credentialType.displayName} account`)
        setIsEditingName(false)
        setTempCredentialName('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center text-xl bg-blue-50 rounded-lg">
                            {credentialType.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={tempCredentialName}
                                        onChange={(e) => setTempCredentialName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleSaveCredentialName}
                                        className="text-xl font-semibold border-0 shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                                        autoFocus
                                        style={{ outline: 'none', boxShadow: 'none' }}
                                    />
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSaveCredentialName}
                                            className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                        >
                                            <Check className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancelEditingName}
                                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <DialogTitle className="text-xl font-semibold cursor-pointer" onClick={handleStartEditingName}>
                                        {credentialName}
                                    </DialogTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleStartEditingName}
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                            <p className="text-sm text-gray-500">{credentialType.displayName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="connection" className="h-full">
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="connection">Connection</TabsTrigger>
                                <TabsTrigger value="sharing" disabled>Sharing</TabsTrigger>
                                <TabsTrigger value="details" disabled>Details</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <TabsContent value="connection" className="space-y-6 mt-0">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex items-center">
                                        <div className="text-sm">
                                            <p className="text-yellow-800">
                                                Need help filling out these fields?{" "}
                                                <span className="text-red-500 cursor-pointer hover:underline">
                                                    Open docs
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {credentialType.properties
                                        .filter(prop => prop.type !== 'hidden')
                                        .map((property) => (
                                            <div key={property.name} className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    {property.displayName}
                                                    {property.required && (
                                                        <span className="text-red-500 ml-1">*</span>
                                                    )}
                                                </label>
                                                {renderField(property)}
                                                {property.description && (
                                                    <p className="text-xs text-gray-500">
                                                        {property.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <div className="w-4 h-4 text-blue-500">ℹ️</div>
                                        <span>
                                            Enterprise plan users can pull in credentials from external vaults.{" "}
                                            <span className="text-red-500 cursor-pointer hover:underline">
                                                More info
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="sharing" className="mt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                        <div className="text-purple-600">✨</div>
                                        <div>
                                            <Button variant="ghost" className="text-purple-600 p-0 h-auto font-normal">
                                                Ask Assistant
                                            </Button>
                                            <span className="text-sm text-gray-600 ml-2">for setup instructions</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        Configure who can access this credential within your organization.
                                    </div>
                                </div>
                            </TabsContent>

                            {/* <TabsContent value="details" className="mt-0">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Credential Name
                                        </label>
                                        <Input
                                            value={credentialName}
                                            onChange={(e) => setCredentialName(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    
                                    <div className="text-sm text-gray-600">
                                        Manage credential details and settings.
                                    </div>
                                </div>
                            </TabsContent> */}
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}