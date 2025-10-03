'use client'
import { WorkflowProvider } from "@/store/workflow/workflow-provider";
import { ProjectProvider } from "@/store/project/project-context";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <ProjectProvider>
                <WorkflowProvider>
                    {children}
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: '#4caf50',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#f44336',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                </WorkflowProvider>
            </ProjectProvider>
        </SessionProvider>
    );
}
