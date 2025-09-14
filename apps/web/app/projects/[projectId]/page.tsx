import { WorkflowList } from "@/components/workflow-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { workflows, projects } from "@/utils/constants"
import { notFound } from "next/navigation"

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  
  const project = projects.data.find(p => p.id === projectId)
  
  // If project not found, show 404
  if (!project) {
    notFound()
  }
  
  // Filter workflows that belong to this project
  const projectWorkflows = workflows.data.filter(w => w.homeProject.id === projectId)
  
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
      <DashboardTabs tabs={projectTabs} />
      <main className="flex-1">
        {projectWorkflows.length > 0 ? (
          <WorkflowList 
            workflows={projectWorkflows} 
            totalCount={projectWorkflows.length} 
          />
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-lg font-medium text-gray-900 mb-2">No workflows in this project yet</h2>
              <p className="text-gray-600">Create your first workflow for this project to get started</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}