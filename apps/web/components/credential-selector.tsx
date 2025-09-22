"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CredentialRecord {
    id: string;
    name: string;
    type: string;
    data: unknown;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface CredentialType {
    name: string;
    displayName?: string;
    required?: boolean;
}

interface CredentialSelectorProps {
    credentialType: CredentialType
    availableCredentials: CredentialRecord[]
    selectedCredential: string
    onCredentialChange: (credentialId: string) => void
    onCreateNew: () => void
}

export function CredentialSelector({
    credentialType,
    availableCredentials,
    selectedCredential,
    onCredentialChange,
    onCreateNew
}: CredentialSelectorProps) {
    const handleValueChange = (value: string) => {
        if (value === "create-new") {
            onCreateNew()
            return
        }
        onCredentialChange(value)
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
                Credential to connect with
                {credentialType.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Select value={selectedCredential} onValueChange={handleValueChange}>
                <SelectTrigger className="w-full h-12 px-3 border border-gray-300 rounded-md">
                    <SelectValue placeholder={`${credentialType.displayName || credentialType.name} account`} />
                </SelectTrigger>
                <SelectContent className="w-full">
                    {availableCredentials.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id} className="p-3">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{credential.name}</div>
                                    {/* <div className="text-xs text-gray-500">{credentialType.displayName || credentialType.name}</div> */}
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
                    <button
                        className="text-blue-600 hover:underline ml-1"
                        onClick={onCreateNew}
                    >
                        Create one now
                    </button>
                </p>
            )}
        </div>
    )
}