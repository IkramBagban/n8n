import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showCreateButton?: boolean
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  showCreateButton = true 
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
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          Create Workflow
        </Button>
      )}
    </div>
  )
}