import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CupShupActivitiesView } from "@/components/activities/CupShupActivitiesView";
import { Button } from "@/components/ui/button";
import { CreateActivityDialog } from "@/components/activities/CreateActivityDialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function ActivitiesPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    checkUserRole();
    if (userRole === 'Vendor') {
      fetchActivities();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole(profile?.role || null);
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_created_by_fkey (
            name
          )
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {userRole === 'Vendor' ? 'All Activities' : 'Activities'}
          </h1>
          {userRole === 'CupShup' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Activity
            </Button>
          )}
        </div>

        {userRole === 'CupShup' ? (
          <CupShupActivitiesView />
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.brand}</TableCell>
                    <TableCell>{activity.city}</TableCell>
                    <TableCell>{activity.location}</TableCell>
                    <TableCell>
                      {format(new Date(activity.start_date), 'PPP')}
                    </TableCell>
                    <TableCell>{activity.profiles?.name || 'Unknown'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <CreateActivityDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            if (userRole === 'CupShup') {
              window.location.reload();
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}