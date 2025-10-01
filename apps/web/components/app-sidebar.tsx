"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Home,
  User,
  Settings,
  FileText,
  Variable,
  BarChart3,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Plus,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import axios from "axios"

const navigationItems = [
  {
    title: "Overview",
    href: "/home/workflows",
    icon: Home,
  },
  {
    title: "Personal",
    href: "/home/personal",
    icon: User,
  },
]

const adminItems = [
  {
    title: "Admin Panel",
    href: "/home/admin",
    icon: Settings,
    disabled: true,
  },
  {
    title: "Templates",
    href: "/home/templates",
    icon: FileText,
    disabled: true,

  },
  {
    title: "Variables",
    href: "/home/variables",
    icon: Variable,
    disabled: true,

  },
  {
    title: "Insights",
    href: "/home/insights",
    icon: BarChart3,
    disabled: true,

  },
  {
    title: "Help",
    href: "/home/help",
    icon: HelpCircle,
    disabled: true,

  },
  {
    title: "What's New",
    href: "/home/whats-new",
    icon: Sparkles,
    badge: "1",
    disabled: true,

  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [projects, setProjects] = React.useState(null);
  const [isCreatingProject, setIsCreatingProject] = React.useState(false);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/rest/projects');
        setProjects(response.data?.data);
      }
      catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, [])

  const handleAddProject = async () => {
    setIsCreatingProject(true);
    try {
      const response = await axios.post('/api/rest/projects', {
        name: "My project",
        icon: {
          type: "icon",
          value: "layers"
        }
      });

      const newProject = response.data.data;
      console.log("Created project:", newProject);

      setProjects((prevProjects: any[] | null) => [...(prevProjects || []), newProject]);

      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <Sidebar variant="sidebar" className="bg-white border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">n8n</span>
          </div>
          <span className="font-semibold text-gray-900">n8n</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2",
                      pathname === item.href && "bg-gray-100 text-gray-900 font-medium"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Projects</h3>
            <div className="space-y-1">
              {projects?.map((project) => (
                <Button
                  key={project.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2"
                  asChild
                >
                  <Link href={`/projects/${project.id}`} className="flex items-center gap-3">
                    {project.type === 'personal' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                    <span className="truncate">{project.name}</span>
                  </Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2"
                onClick={handleAddProject}
                disabled={isCreatingProject}
              >
                <Plus className="w-4 h-4" />
                {isCreatingProject ? "Creating..." : "Add project"}
              </Button>
            </div>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2",
                      pathname === item.href && "bg-gray-100 text-gray-900 font-medium"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 cursor-not-allowed" aria-disabled={item.disabled}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            N
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium">ikram</p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-1">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}