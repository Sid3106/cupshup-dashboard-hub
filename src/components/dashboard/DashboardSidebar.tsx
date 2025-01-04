import { Home, Users, Briefcase, ClipboardList } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Overview",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Users",
    icon: Users,
    url: "/dashboard/users",
  },
  {
    title: "Activities",
    icon: Briefcase,
    url: "/dashboard/activities",
  },
  {
    title: "Tasks",
    icon: ClipboardList,
    url: "/dashboard/tasks",
  },
];

export function DashboardSidebar() {
  return (
    <Sidebar className="bg-white border-r">
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-[#00A979]">CupShup</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2 text-gray-600 hover:text-[#00A979] hover:bg-[#00A979]/5">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}