import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { projects } from "@/app/utils/constants"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, XCircle, AlertCircle, ChevronDown, MoreHorizontal } from "lucide-react"

interface ProjectExecutionsPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectExecutionsPage({ params }: ProjectExecutionsPageProps) {
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
      <DashboardTabs tabs={projectTabs} defaultValue="executions" />
      <main className="flex-1 p-6">
        <div className="w-full">
          
          {/* Header with filter and Create Workflow button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="h-8">
                <Search className="w-4 h-4 mr-2" />
              </Button>
              <span className="text-sm text-gray-500">No active executions</span>
              <Button variant="ghost" size="sm" className="h-8 text-gray-500">
                <AlertCircle className="w-4 h-4" />
              </Button>
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Create Workflow
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Executions Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Workflow</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Started</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Run Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Exec. ID</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">find gigs</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Error</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">Sep 13, 00:25:38</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">110ms</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">2</span>
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* No more executions message */}
            <div className="text-center py-8 text-gray-500 text-sm border-t border-gray-200">
              No more executions to fetch
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}