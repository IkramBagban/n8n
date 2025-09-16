import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Key } from "lucide-react"
import { projectInstance } from "@/actions/projects"

interface ProjectCredentialsPageProps {
    params: {
        projectId: string
    }
}

export default async function ProjectCredentialsPage({ params }: ProjectCredentialsPageProps) {
    const { projectId } = await params

    const project = await projectInstance.getProjectById(projectId)


    // If project not found, show 404
    if (!project) {
        notFound()
    }

    // Project tabs
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

    // Mock credentials data
    const credentials = [
        {
            id: "1",
            name: "GitHub API",
            type: "GitHub",
            status: "connected",
            lastUsed: "2 hours ago"
        },
        {
            id: "2",
            name: "Google Sheets",
            type: "Google",
            status: "connected",
            lastUsed: "1 day ago"
        },
        {
            id: "3",
            name: "Slack Bot",
            type: "Slack",
            status: "error",
            lastUsed: "3 days ago"
        }
    ]

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            <DashboardHeader
                title={project.name}
                subtitle={project.description || "this is my project description"}
            />
            <DashboardTabs tabs={projectTabs} defaultValue="credentials" />
            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Credentials</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage your project credentials</p>
                        </div>
                        <Button className="bg-red-500 hover:bg-red-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Credential
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search credentials"
                                className="pl-10"
                            />
                        </div>
                    </div>

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

                </div>
            </main>
        </div>
    )
}