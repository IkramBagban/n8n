import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { projectInstance } from "@/actions/projects"
import { ProjectSettingsForm } from "@/components/project-settings-form"

interface ProjectSettingsPageProps {
    params: {
        projectId: string
    }
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
    const { projectId } = await params

    const project = await projectInstance.getProjectById(projectId)

    if (!project) {
        notFound()
    }

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

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            <DashboardHeader
                title={project.name}
                subtitle={project.description}
            />
            <DashboardTabs tabs={projectTabs} defaultValue="project-settings" />
            <main className="flex-1 p-6">
                <div className="max-w-4xl">
                    <div className="p-6 space-y-8">

                        <ProjectSettingsForm project={project} />

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Project members</h3>

                            <div className="mb-4">
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-gray-500">Add users...</span>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user1">John Doe (john@example.com)</SelectItem>
                                        <SelectItem value="user2">Jane Smith (jane@example.com)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarFallback className="bg-red-100 text-red-600 font-medium">
                                                IK
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-gray-900">Ikram (you)</div>
                                            <div className="text-sm text-gray-500">ikrambagban.dev@gmail.com</div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                        Owner
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                            <Button variant="outline">
                                Cancel
                            </Button>
                            <Button className="bg-red-500 hover:bg-red-600 text-white">
                                Save
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Danger zone</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                When deleting a project, you can also choose to move all workflows and credentials to another project.
                            </p>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                Delete this project
                            </Button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}