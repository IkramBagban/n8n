import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { ExecutionsList } from "@/components/executions-list"
import { notFound } from "next/navigation"
import { projectInstance } from "@/actions/projects"

interface ProjectExecutionsPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectExecutionsPage({ params }: ProjectExecutionsPageProps) {
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
        subtitle={project.description || "this is my project description"}
      />
      <DashboardTabs tabs={projectTabs} defaultValue="executions" />
      <main className="flex-1 p-6">
        <ExecutionsList projectId={projectId} />
      </main>
    </div>
  )
}