"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Layers } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

interface ProjectSettingsFormProps {
    project: {
        id: string
        name: string
        description: string | null
        icon?: any
    }
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await axios.put(`/api/rest/projects/${project.id}`, {
                name: formData.name,
                description: formData.description || null,
                icon: project.icon,
            })

            alert("Project updated successfully!")

            router.refresh()
        } catch (error) {
            console.error("Error updating project:", error)
            alert("Failed to update project. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: project.name,
            description: project.description || "",
        })
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const isChanged = formData.name !== project.name || formData.description !== (project.description || "")

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project icon and name</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg border border-gray-200">
                        <Layers className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <Input
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="max-w-md"
                            placeholder="Project name"
                            required
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project description</h3>
                <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="min-h-[100px] resize-none"
                    placeholder="Enter project description..."
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    disabled={isLoading || !isChanged}
                >
                    {isLoading ? "Saving..." : "Save"}
                </Button>
            </div>
        </form>
    )
}