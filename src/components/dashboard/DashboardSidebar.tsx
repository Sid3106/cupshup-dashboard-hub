import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Users, Store, Building2, CalendarDays } from "lucide-react";

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

  const isCupShup = userProfile?.role === 'CupShup';

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col gap-4">
        <NavLink
          to="/dashboard/users"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent",
              isActive && "bg-accent"
            )
          }
        >
          <Users className="h-4 w-4" />
          <span>Users</span>
        </NavLink>
        <NavLink
          to="/dashboard/vendors"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent",
              isActive && "bg-accent"
            )
          }
        >
          <Store className="h-4 w-4" />
          <span>Vendors</span>
        </NavLink>
        <NavLink
          to="/dashboard/clients"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent",
              isActive && "bg-accent"
            )
          }
        >
          <Building2 className="h-4 w-4" />
          <span>Clients</span>
        </NavLink>
        {isCupShup && (
          <NavLink
            to="/dashboard/activities"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent",
                isActive && "bg-accent"
              )
            }
          >
            <CalendarDays className="h-4 w-4" />
            <span>Activities</span>
          </NavLink>
        )}
      </SidebarContent>
    </Sidebar>
  );
}