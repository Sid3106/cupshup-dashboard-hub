import { Home, Users, Briefcase, UserCircle, Wrench, Activity, ClipboardList } from "lucide-react";
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
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Users",
    icon: Users,
    url: "/dashboard/users",
  },
  {
    title: "Vendors",
    icon: Briefcase,
    url: "/dashboard/vendors",
  },
  {
    title: "Clients",
    icon: UserCircle,
    url: "/dashboard/clients",
  },
  {
    title: "Services",
    icon: Wrench,
    url: "/dashboard/services",
  },
  {
    title: "Activities",
    icon: Activity,
    url: "/dashboard/activities",
  },
  {
    title: "Tasks",
    icon: ClipboardList,
    url: "/dashboard/tasks",
  },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
                  <SidebarMenuButton
                    asChild
                    className={location.pathname === item.url ? "text-[#00A979] bg-[#00A979]/5" : ""}
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className="flex items-center gap-2 text-gray-600 hover:text-[#00A979] hover:bg-[#00A979]/5 w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
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