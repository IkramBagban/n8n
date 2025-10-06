import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { MetricsGrid } from "@/components/metrics-grid"

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


const metricsData = [
    {
        title: "Prod. executions",
        value: 0,
        subtitle: "Last 7 days",
        variant: "default" as const
    },
    {
        title: "Failed prod. executions",
        value: 0,
        subtitle: "Last 7 days",
        variant: "default" as const
    },
    {
        title: "Failure rate",
        value: 0,
        subtitle: "Last 7 days",
        variant: "percentage" as const
    },
    {
        title: "Time saved",
        value: "—",
        subtitle: "Last 7 days",
        variant: "default" as const
    },
    {
        title: "Run time (avg.)",
        value: 0,
        subtitle: "Last 7 days",
        variant: "time" as const
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