"use client"

import { CredentialSelector } from "./credential-selector"

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

interface CredentialsSectionProps {
    credentials: CredentialType[]
    availableCredentials: CredentialRecord[]
    selectedCredentials: Record<string, string>
    onCredentialChange: (credentialType: string, credentialId: string) => void
    onCreateCredential: (credentialType: string) => void
}

export function CredentialsSection({
    credentials,
    availableCredentials,
    selectedCredentials,
    onCredentialChange,
    onCreateCredential
}: CredentialsSectionProps) {
    if (!credentials || credentials.length === 0) {
        return <p className="text-sm text-gray-500">No credentials required for this node.</p>
    }

    return (
        <div className="space-y-4">
            {credentials.map((credentialType) => {
                const typeCredentials = availableCredentials.filter(
                    (cred) => cred.type === credentialType.name
                )
                const selectedCredential = selectedCredentials[credentialType.name] || ''

                return (
                    <CredentialSelector
                        key={credentialType.name}
                        credentialType={credentialType}
                        availableCredentials={typeCredentials}
                        selectedCredential={selectedCredential}
                        onCredentialChange={(credentialId) => 
                            onCredentialChange(credentialType.name, credentialId)
                        }
                        onCreateNew={() => onCreateCredential(credentialType.name)}
                    />
                )
            })}
        </div>
    )
}