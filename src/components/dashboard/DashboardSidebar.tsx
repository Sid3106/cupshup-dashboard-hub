import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays,
  ListChecks,
  ClipboardCheck
} from "lucide-react";

export function DashboardSidebar() {
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isVendor = userProfile?.role === 'Vendor';
  const isCupShup = userProfile?.role === 'CupShup';

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col gap-4 bg-primary text-white p-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
              isActive && "bg-white/10"
            )
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>

        {isVendor && (
          <>
            <NavLink
              to="/dashboard/activities"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
                  isActive && "bg-white/10"
                )
              }
            >
              <CalendarDays className="h-4 w-4" />
              <span>Activities</span>
            </NavLink>
            <NavLink
              to="/dashboard/my-activities"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
                  isActive && "bg-white/10"
                )
              }
            >
              <ListChecks className="h-4 w-4" />
              <span>My Activities</span>
            </NavLink>
            <NavLink
              to="/dashboard/my-tasks"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
                  isActive && "bg-white/10"
                )
              }
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>My Tasks</span>
            </NavLink>
          </>
        )}

        {isCupShup && (
          <>
            <NavLink
              to="/dashboard/activities"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
                  isActive && "bg-white/10"
                )
              }
            >
              <CalendarDays className="h-4 w-4" />
              <span>Activities</span>
            </NavLink>
            <NavLink
              to="/dashboard/mapped-activities"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
                  isActive && "bg-white/10"
                )
              }
            >
              <ListChecks className="h-4 w-4" />
              <span>Mapped Activities</span>
            </NavLink>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}