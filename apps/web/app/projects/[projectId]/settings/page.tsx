import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { projects } from "@/app/utils/constants"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Layers, ChevronDown } from "lucide-react"

interface ProjectSettingsPageProps {
    params: {
        projectId: string
    }
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
    const { projectId } = await params

    const project = projects.data.find(p => p.id === projectId)

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

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            <DashboardHeader
                title={project.name}
                subtitle={project.description || "this is my project description"}
            />
            <DashboardTabs tabs={projectTabs} defaultValue="project-settings" />
            <main className="flex-1 p-6">
                <div className="max-w-4xl">
                    <div className="p-6 space-y-8">

                        {/* Project icon and name */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Project icon and name</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg border border-gray-200">
                                    <Layers className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <Input
                                        defaultValue={project.name}
                                        className="max-w-md"
                                        placeholder="Project name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project description */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Project description</h3>
                            <Textarea
                                defaultValue={project.description || "this is my project description"}
                                className="min-h-[100px] resize-none"
                                placeholder="Enter project description..."
                            />
                        </div>

                        {/* Project members */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Project members</h3>

                            {/* Add users dropdown */}
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

                            {/* Current members */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarFallback className="bg-red-100 text-red-600 font-medium">
                                                KR
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

                        {/* Save/Cancel buttons */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                            <Button variant="outline">
                                Cancel
                            </Button>
                            <Button className="bg-red-500 hover:bg-red-600 text-white">
                                Save
                            </Button>
                        </div>

                        {/* Danger zone */}
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