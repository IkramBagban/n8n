"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { availableCredentials } from "@/utils/credentials-registry"
import { ICredentialType } from "@repo/nodes-base/types"
import { CredentialConfigModal } from "@/components/credential-config-modal"

interface CreateCredentialModalProps {
    isOpen: boolean
    onClose: () => void
    projectId?: string
}

export function CreateCredentialModal({ isOpen, onClose, projectId = "cmfjrtqt40001v7oc8j6a4rz2" }: CreateCredentialModalProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCredential, setSelectedCredential] = useState<ICredentialType | null>(null)
    const [showConfigModal, setShowConfigModal] = useState(false)

    console.log('availableCredentials', availableCredentials)
    const filteredCredentials = availableCredentials.filter(credential => credential.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleContinue = () => {
        if (selectedCredential) {
            console.log("Opening config modal for:", selectedCredential.name)
            setShowConfigModal(true)
        }
    }

    const handleClose = () => {
        setSearchQuery("")
        setSelectedCredential(null)
        setShowConfigModal(false)
        onClose()
    }

    const handleConfigModalClose = () => {
        setShowConfigModal(false)
        handleClose()
    }

    return (
        <>
            <Dialog open={isOpen && !showConfigModal} onOpenChange={handleClose}>
                <DialogContent className="max-w-lg w-full">
                    <DialogHeader className="flex flex-row items-center justify-between pb-4">
                        <DialogTitle className="text-xl font-semibold">
                            Add new credential
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-3">
                                Select an app or service to connect to
                            </p>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search for app..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="h-64 border rounded-lg overflow-y-auto">
                            <div className="p-2">
                                {filteredCredentials.map((credential) => (
                                    <div
                                        key={credential.name}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedCredential?.name === credential.name
                                            ? 'bg-blue-50 border border-blue-200'
                                            : ''
                                            }`}
                                        onClick={() => setSelectedCredential(credential)}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {credential.displayName}
                                            </div>
                                        </div>
                                        {selectedCredential?.name === credential.name && (
                                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filteredCredentials.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">No credentials found</p>
                                        <p className="text-xs mt-1">Try searching with different keywords</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleContinue}
                                disabled={!selectedCredential}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedCredential && (
                <CredentialConfigModal
                    isOpen={showConfigModal}
                    onClose={handleConfigModalClose}
                    credentialType={{
                        id: selectedCredential.name,
                        displayName: selectedCredential.displayName,
                        icon: "🔧",
                        properties: selectedCredential.properties
                    }}
                    projectId={projectId}
                />
            )}
        </>
    )
}