import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal, Filter, User, Layers } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { WorkflowListProps } from "@/lib/types"



export function WorkflowList({ workflows, totalCount }: WorkflowListProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`
        }

        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) {
            return `${diffInHours} hours ago`
        }

        return date.toLocaleDateString()
    }


    const getProjectIcon = (project: any) => {
        if (project?.type === 'personal') {
            return <User className="w-4 h-4" />;
        }
        return <Layers className="w-4 h-4" />;
    };


    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search"
                            className="pl-10"
                        />
                    </div>
                    <select className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white">
                        <option value="last-updated">Sort by last updated</option>
                        <option value="name">Sort by name</option>
                        <option value="created">Sort by created</option>
                    </select>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {workflows.map((workflow) => (
                    <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                            <Link className="flex-1 cursor-pointer" href={`/workflow/${workflow.id}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>

                                </div>
                                <p className="text-sm text-gray-500">
                                    Last updated {formatDate(workflow.updatedAt)} | Created {formatDate(workflow.createdAt)}
                                </p>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    <span className="text-sm text-gray-500">
                                        {getProjectIcon(workflow.project)}
                                    </span>
                                    {workflow.project.type === 'personal' ? 'Personal' : workflow.project.name}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Inactive</span>
                                    <Switch />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    Total {totalCount}
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        1
                    </Badge>
                    <select className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white">
                        <option value="10">10/page</option>
                        <option value="25">25/page</option>
                        <option value="50">50/page</option>
                        <option value="100">100/page</option>
                    </select>
                </div>
            </div>
        </div>
    )
}