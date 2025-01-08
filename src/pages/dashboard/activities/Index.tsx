import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CupShupActivitiesView } from "@/components/activities/CupShupActivitiesView";
import { MyActivitiesTable } from "@/components/activities/MyActivitiesTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function ActivitiesPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setUserRole(profile.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user role",
          variant: "destructive",
        });
      }
    };

    fetchUserRole();
  }, [toast]);

  const handleRowClick = (id: string) => {
    navigate(`/dashboard/my-activities/${id}`);
  };

  if (!userRole) return null;

  return (
    <DashboardLayout>
      {userRole === "CupShup" ? (
        <CupShupActivitiesView />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Activities</h1>
            <p className="text-muted-foreground">
              View activities assigned to you
            </p>
          </div>
          <MyActivitiesTable onRowClick={handleRowClick} activities={[]} />
        </div>
      )}
    </DashboardLayout>
  );
}