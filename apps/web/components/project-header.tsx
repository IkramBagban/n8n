"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { useProject } from "@/store/project/project-context"
import { useEffect, useState } from "react"

interface ProjectHeaderProps {
    projectId: string
    initialProject: {
        name: string
        description: string | null
    }
}

export function ProjectHeader({ projectId, initialProject }: ProjectHeaderProps) {
    const { projects } = useProject()
    const [currentProject, setCurrentProject] = useState(initialProject)

    useEffect(() => {
        if (projects) {
            const updatedProject = projects.find(p => p.id === projectId)
            if (updatedProject) {
                setCurrentProject({
                    name: updatedProject?.name,
                    description: updatedProject?.description || null
                })
            }
        }
    }, [projects, projectId])

    return (
        <DashboardHeader
            title={currentProject.name}
            subtitle={currentProject.description}
        />
    )
}