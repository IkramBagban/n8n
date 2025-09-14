'use client' 
import { ProjectList } from "@/components/project-list"
import { projects } from "@/utils/constants"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <ProjectList projects={projects.data} />
    </div>
  )
}