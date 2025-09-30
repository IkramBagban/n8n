import { CreateDropdown } from "./create-dropdown"

interface DashboardHeaderProps {
    title: string
    subtitle?: string
    showCreateButton?: boolean
    projectId?: string
}

export function DashboardHeader({
    title,
    subtitle,
    showCreateButton = true,
    // projectId = "cmfjrtqt40001v7oc8j6a4rz2"
}: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
            </div>
            {showCreateButton && (
                // <CreateDropdown projectId={projectId} />
                <CreateDropdown />
            )}
        </div>
    )
}