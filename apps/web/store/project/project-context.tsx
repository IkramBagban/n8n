'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Project {
  id: string
  name: string
  description?: string
  type: 'personal' | 'team'
  icon?: { type: string; value: string } | null
  userId: string
  createdAt: string
  updatedAt: string
}

interface ProjectContextType {
  projects: Project[] | null
  setProjects: (projects: Project[]) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  addProject: (project: Project) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[] | null>(null)

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prevProjects => {
      if (!prevProjects) return null
      return prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    })
  }, [])

  const addProject = useCallback((project: Project) => {
    setProjects(prevProjects => [...(prevProjects || []), project])
  }, [])

  const value: ProjectContextType = {
    projects,
    setProjects,
    updateProject,
    addProject,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}