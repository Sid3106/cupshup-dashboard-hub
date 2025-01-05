import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState("...");

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
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session exists, just redirect to auth page
        navigate("/auth");
        return;
      }

      // Clear any existing session data first
      await supabase.auth.signOut({ scope: 'local' });
      
      // Then attempt to sign out globally
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Logout error:", error);
        // For session_not_found errors, we can just redirect
        if (error.message.includes("session_not_found")) {
          navigate("/auth");
          return;
        }
        // For other errors, show the error message but still redirect
        toast.error("Error during logout, but you've been signed out locally");
        navigate("/auth");
        return;
      }

      // If logout was successful
      navigate("/auth");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear local session and redirect
      await supabase.auth.signOut({ scope: 'local' });
      navigate("/auth");
      toast.error("Error during logout, but you've been signed out locally");
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#00A979] hover:bg-[#00A979]/5">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-[#00A979] text-white">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}