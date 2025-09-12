"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardTabsProps {
  tabs: Array<{
    value: string
    label: string
    href: string
  }>
  defaultValue?: string
}

export function DashboardTabs({ tabs, defaultValue }: DashboardTabsProps) {
  const pathname = usePathname()
  
  const currentTab = defaultValue || tabs.find(tab => pathname.includes(tab.value))?.value || tabs[0]?.value

  return (
    <div className="border-b border-gray-200">
      <Tabs value={currentTab} className="w-full">
        <TabsList className="h-auto p-0 bg-transparent space-x-0 rounded-none border-none">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-500 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <Link href={tab.href}>
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}