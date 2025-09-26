'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { status } = useSession();
  const pathname = usePathname();
  
  const isAuthPage = pathname?.startsWith('/signin') || pathname?.startsWith('/signup');
  
  if (status === 'loading' && !isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  if (status === 'authenticated') {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  return <>{children}</>;
}