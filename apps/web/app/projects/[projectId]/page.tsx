import { WorkflowList } from "@/components/workflow-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { notFound } from "next/navigation"
import { getWorkflowsOfProject } from "@/actions/workflows"
import { projectInstance } from "@/actions/projects"

interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params

  if (!projectId) {
    alert("projectId is not provided")
    notFound()
  }

  const project = await projectInstance.getProjectById(projectId)
  const { data } = await getWorkflowsOfProject(projectId)

  const projectWorkflows = data

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
      <DashboardTabs tabs={projectTabs} />
      <main className="flex-1">
        {projectWorkflows?.length > 0 ? (
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