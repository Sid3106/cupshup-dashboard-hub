import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CupShupActivitiesView } from "@/components/activities/CupShupActivitiesView";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { Activity } from "@/types/activities";

export default function ActivitiesPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

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

      if (profile?.role === 'Vendor') {
        fetchActivities();
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setError("Failed to check user role");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('activities')
        .select('*')
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError("Failed to fetch activities");
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

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {userRole === 'Vendor' ? 'All Activities' : 'Activities'}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'Vendor' 
              ? 'View all available activities' 
              : 'Manage and assign activities'}
          </p>
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
                  <TableHead>End Date</TableHead>
                  <TableHead>Activity ID</TableHead>
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
                    <TableCell>
                      {format(new Date(activity.end_date), 'PPP')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {activity.activity_id}
                    </TableCell>
                  </TableRow>
                ))}
                {activities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No activities found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}