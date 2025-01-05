import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InviteUserDialog } from "@/components/users/InviteUserDialog";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  email: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        navigate("/auth");
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!profile) {
          toast({
            title: "Profile not found",
            description: "Please contact an administrator to set up your profile.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        setCurrentUserRole(profile.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user role. Please try again later.",
          variant: "destructive",
        });
      }
    };

    const fetchUsers = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await supabase.functions.invoke('get-users', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to fetch users');
        }

        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUserRole();
    fetchUsers();
  }, [navigate, toast]);

  if (currentUserRole !== "CupShup") {
    return (
      <DashboardLayout>
        <div className="text-center mt-8">
          You don't have permission to access this page.
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center mt-8">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card
              key={user.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/dashboard/users/${user.id}`)}
            >
              <h3 className="font-semibold text-lg mb-2">{user.name || 'N/A'}</h3>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Role: {user.role}</p>
                <p>City: {user.city || 'N/A'}</p>
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone_number}</p>
              </div>
            </Card>
          ))}
        </div>

        <InviteUserDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}