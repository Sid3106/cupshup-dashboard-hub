import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserSquare2, 
  CalendarDays, 
  ListChecks,
  Settings,
  Award,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("...");
  const [userEmail, setUserEmail] = useState("");

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile?.name) {
          const initials = profile.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          setUserInitials(initials);
        }
        setUserEmail(session.user.email || "");
      }
    };

    fetchUserProfile();
  }, []);

  const isVendor = userProfile?.role === 'Vendor';
  const isCupShup = userProfile?.role === 'CupShup';
  const isClient = userProfile?.role === 'Client';

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden text-primary"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <Sidebar className={cn(
        "fixed inset-y-0 left-0 z-40 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                CS
              </div>
              <h1 className="text-xl font-bold">CupShup AI</h1>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/5 hover:text-primary font-montserrat",
                  isActive && "bg-primary/5 text-primary"
                )
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>

            {isCupShup && (
              <>
                <NavLink
                  to="/dashboard/users"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/5 hover:text-primary font-montserrat",
                      isActive && "bg-primary/5 text-primary"
                    )
                  }
                >
                  <Users className="h-5 w-5" />
                  <span>Team CupShup</span>
                </NavLink>

                <NavLink
                  to="/dashboard/vendors"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/5 hover:text-primary font-montserrat",
                      isActive && "bg-primary/5 text-primary"
                    )
                  }
                >
                  <Building2 className="h-5 w-5" />
                  <span>Services</span>
                </NavLink>

                <NavLink
                  to="/dashboard/clients"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/5 hover:text-primary font-montserrat",
                      isActive && "bg-primary/5 text-primary"
                    )
                  }
                >
                  <UserSquare2 className="h-5 w-5" />
                  <span>Clients</span>
                </NavLink>

                <NavLink
                  to="/dashboard/mapped-activities"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/5 hover:text-primary font-montserrat",
                      isActive && "bg-primary/5 text-primary"
                    )
                  }
                >
                  <Award className="h-5 w-5" />
                  <span>Leaderboard</span>
                </NavLink>
              </>
            )}

            {isVendor && (
              <NavLink
                to="/dashboard/my-activities"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/5 hover:text-primary font-montserrat",
                    isActive && "bg-primary/5 text-primary"
                  )
                }
              >
                <CalendarDays className="h-5 w-5" />
                <span>My Activities</span>
              </NavLink>
            )}
          </nav>

          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userProfile?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
}