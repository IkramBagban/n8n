import { WelcomeSection } from "@/components/welcome-section"
import { WorkflowList } from "@/components/workflow-list"
import { workflows } from "@/utils/constants"

export default function WorkflowsPage() {

    if (workflows.data.length > 0) {
        return (
            <div className="flex flex-col min-h-full">
                <WorkflowList
                    workflows={workflows.data}
                    totalCount={workflows.count}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-full">
            <div className="flex-1">
                <WelcomeSection />
            </div>
        </div>
    )
}