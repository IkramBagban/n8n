import { DashboardHeader } from "@/components/dashboard-header"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Key, MoreHorizontal, Calendar } from "lucide-react"
import prismaClient from "@repo/db"
import { authOptions } from "@/lib/auth"


interface Credential {
    id: string
    name: string
    type: string
    createdAt: string
    updatedAt: string
    projectId: string
    projectName: string
}

async function getAllUserCredentials(): Promise<Credential[]> {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return []
        }

        const userProjects = await prismaClient.project.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                id: true,
                name: true
            }
        })

        if (userProjects.length === 0) {
            return []
        }

        const projectIds = userProjects.map(p => p.id)

        const credentials = await prismaClient.credentials.findMany({
            where: {
                projectId: {
                    in: projectIds
                }
            },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
                projectId: true,
                project: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return credentials.map(credential => ({
            ...credential,
            createdAt: credential.createdAt.toISOString(),
            updatedAt: credential.updatedAt.toISOString(),
            projectName: credential.project.name
        }))
    } catch (error) {
        console.error('Error fetching user credentials:', error)
        return []
    }
}

function getCredentialIcon(type: string): string {
    const iconMap: Record<string, string> = {
        'TelegramApi': '📱',
        'GmailOAuth2Api': '📧',
    }
    return iconMap[type] || iconMap.default
}

function getCredentialDisplayName(type: string): string {
    const nameMap: Record<string, string> = {
        'TelegramApi': 'Telegram',
        'GmailOAuth2Api': 'Gmail',
    }
    return nameMap[type] || type
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Less than an hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
}

export default async function CredentialsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/ signin')
    }

    const credentials = await getAllUserCredentials()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search credentials..."
                            className="pl-8 w-64"
                        />
                    </div>
                    <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option>Sort by last updated</option>
                        <option>Sort by name</option>
                        <option>Sort by created date</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {credentials.length > 0 ? (
                    <div className="space-y-3">
                        {credentials.map((credential) => (
                            <div
                                key={credential.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getCredentialIcon(credential.type)}</span>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{credential.name}</h3>
                                            <div className="flex text-sm text-gray-500 gap-1">

                                                <p className="">{getCredentialDisplayName(credential.type)}</p> |
                                                <span className="">
                                                    {formatDate(credential.updatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-xs">
                                            {credential.projectName}
                                        </Badge>
                                    </span>
                                    {/* <Badge variant="secondary" className="text-xs">
                                        {getCredentialDisplayName(credential.type)}
                                    </Badge> */}
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>


                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
                        <p className="text-gray-500 mb-4">Add your first credential to connect to external services</p>
                        <Button className="bg-red-500 hover:bg-red-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Credential
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}