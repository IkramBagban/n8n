import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"

const dashboardTabs = [
    {
        value: "workflows",
        label: "Workflows",
        href: "/home/workflows"
    },
    {
        value: "credentials",
        label: "Credentials",
        href: "/home/credentials"
    },
    {
        value: "executions",
        label: "Executions",
        href: "/home/executions"
    }
]

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DashboardHeader
                title="Overview"
                subtitle="All the workflows, credentials and executions you have access to"
            />
            <main className="flex-1 bg-gray-50">
                {/* <MetricsGrid metrics={metricsData} /> */}

                <DashboardTabs tabs={dashboardTabs} />
                {children}
            </main>
        </>
    )
}