import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal, Plus, Layers } from "lucide-react"
import Link from "next/link"

interface Project {
    id: string
    name: string
    type: string
    description?: string | null
    createdAt: string
    updatedAt: string
    icon?: {
        type: string
        value: string
    } | null
}

interface ProjectListProps {
    projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    const getProjectIcon = (project: Project) => {
        if (project.icon?.value) {
            return <Layers className="w-5 h-5 text-gray-600" />
        }
        if (project.type === 'personal') {
            return '👤'
        }
        return '📁'
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
                    <p className="text-sm text-gray-600 mt-1">Organize your workflows in projects</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search projects"
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                                        {getProjectIcon(project)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                                        <Badge variant="secondary" className="text-xs mt-1">
                                            {project.type === 'personal' ? 'Personal' : 'Team'}
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>

                            {project.description && (
                                <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                            )}

                            <div className="text-xs text-gray-500">
                                Created {formatDate(project.createdAt)}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>


            {projects.length === 0 && (
                <div className="text-center py-12">
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4">
                        <Layers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h2>
                    <p className="text-gray-600 mb-4">Create your first project to organize your workflows</p>
                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                    </Button>
                </div>
            )}
        </div>
    )
}