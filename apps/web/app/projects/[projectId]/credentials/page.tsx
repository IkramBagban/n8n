import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Key, MoreHorizontal } from "lucide-react"
import { projectInstance } from "@/actions/projects"
import { getServerSession } from "next-auth"
import prismaClient from "@repo/db"
import { authOptions } from "../../../../lib/auth"


interface ProjectCredentialsPageProps {
    params: Promise<{ projectId: string }>
}

interface Credential {
    id: string
    name: string
    type: string
    createdAt: string
    updatedAt: string
}

async function getCredentials(projectId: string): Promise<Credential[]> {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return []
        }

        const project = await prismaClient.project.findFirst({
            where: {
                id: projectId,
                userId: session.user.id
            }
        })

        if (!project) {
            return []
        }

        const credentials = await prismaClient.credentials.findMany({
            where: {
                projectId
            },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return credentials.map(cred => ({
            ...cred,
            createdAt: cred.createdAt.toISOString(),
            updatedAt: cred.updatedAt.toISOString()
        }))
    } catch (error) {
        console.error('Error fetching credentials:', error)
        return []
    }
}

export default async function ProjectCredentialsPage({ params }: ProjectCredentialsPageProps) {
    const { projectId } = await params

    const project = await projectInstance.getProjectById(projectId)

    if (!project) {
        notFound()
    }

    const credentials = await getCredentials(projectId)

    const projectTabs = [
        {
            value: "workflows",
            label: "Workflows",
            href: `/projects/${projectId}`
        },
        {
            value: "credentials",
            label: "Credentials",
            href: `/projects/${projectId}/credentials`
        },
        {
            value: "executions",
            label: "Executions",
            href: `/projects/${projectId}/executions`
        },
        {
            value: "project-settings",
            label: "Project settings",
            href: `/projects/${projectId}/settings`
        }
    ]

    const getCredentialDisplayName = (type: string) => {
        switch (type.toLowerCase()) {
            case 'telegramapi':
                return 'Telegram API'
            case 'gmailoauth2api':
                return 'Gmail OAuth2 API'
            default:
                return type
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) {
            return 'just now'
        } else if (diffInHours < 24) {
            return `${diffInHours} hours ago`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
        }
    }

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            <DashboardHeader
                title={project.name}
                subtitle={project.description || "this is my project description"}
            />
            <DashboardTabs tabs={projectTabs} defaultValue="credentials" />
            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">



                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search credentials..."
                                className="pl-10"
                            />
                        </div>
                        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                            <option>Sort by last updated</option>
                            <option>Sort by name</option>
                            <option>Sort by type</option>
                        </select>
                    </div>

                    {credentials.length > 0 ? (
                        <div className="space-y-3">
                            {credentials.map((credential) => (
                                <div key={credential.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{credential.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{getCredentialDisplayName(credential.type)}</span>
                                                <span>|</span>
                                                <span>Last updated {formatDate(credential.updatedAt)}</span>
                                                <span>|</span>
                                                <span>Created {new Date(credential.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                            {project.name}
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4">
                                <Key className="w-8 h-8 text-gray-400" />
                            </div>
                            <h2 className="text-lg font-medium text-gray-900 mb-2">No credentials yet</h2>
                            <p className="text-gray-600 mb-4">Add your first credential to connect external services</p>
                            <Button className="bg-red-500 hover:bg-red-600 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Credential
                            </Button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    )
}