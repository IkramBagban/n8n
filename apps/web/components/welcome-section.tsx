import { Button } from "@/components/ui/button"
import { FileIcon, BriefcaseIcon } from "lucide-react"

interface WelcomeSectionProps {
  userName?: string
}

export function WelcomeSection({ userName = "Ikram" }: WelcomeSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          👋 Welcome {userName}!
        </h2>
        <p className="text-gray-600">Create your first workflow</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md w-full">
        <WorkflowCard
          icon={<FileIcon className="w- 12 h-12 text-gray-400" />}
          title="Start from scratch"
          description="Create a new workflow from the beginning"
          href="/home/workflows/new"
        />
        
        <WorkflowCard
          icon={<BriefcaseIcon className="w-12 h-12 text-gray-400" />}
          title="Try a pre-built agent"
          description="Use one of our template workflows"
          href="/home/workflows/templates"
        />
      </div>
    </div>
  )
}

interface WorkflowCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}

function WorkflowCard({ icon, title, description, href }: WorkflowCardProps) {
  return (
    <Button
      variant="outline"
      className="h-auto p-6 flex flex-col items-center text-center space-y-3 hover:bg-gray-50 border-gray-200"
      asChild
    >
      <a href={href}>
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </a>
    </Button>
  )
}