"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateCredentialModal } from "@/components/create-credential-modal"
import Link from "next/link"
import { useParams } from "next/navigation"



export function CreateDropdown() {
    const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const params = useParams()
    const projectId = params?.projectId as string | undefined

    // If no projectId, workflows and credentials will be created in personal project

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <>
            <div className="relative" ref={dropdownRef}>    
                <Button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Workflow
                    <ChevronDown className="w-4 h-4" />
                </Button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-1">
                            <Link
                                href={projectId ? `/workflow/new?projectId=${projectId}` : `/workflow/new`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                Create Workflow
                            </Link>
                            <button
                                onClick={() => {
                                    setIsCredentialModalOpen(true)
                                    setIsDropdownOpen(false)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                Create Credential
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CreateCredentialModal
                isOpen={isCredentialModalOpen}
                onClose={() => setIsCredentialModalOpen(false)}
                projectId={projectId}
            />
        </>
    )
}