'use client'
import { WorkflowProvider } from "@/store/workflow/workflow-provider";
import { SessionProvider } from "next-auth/react"

export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <WorkflowProvider>


                {children}
            </WorkflowProvider>

        </SessionProvider >
    );
}
