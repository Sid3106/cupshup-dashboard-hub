import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@supabase/auth-helpers-react";

interface MyActivity {
  id: string;
  activity_mapping_id: string;
  activities: {
    brand: string;
    city: string;
    location: string;
    start_date: string;
    end_date: string;
    activity_description: string | null;
  };
  message: string | null;
  created_at: string;
}

export default function MyActivitiesPage() {
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const user = useUser();

  useEffect(() => {
    if (user) {
      fetchMyActivities();
    }
  }, [user]);

  const fetchMyActivities = async () => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!vendorData) {
        throw new Error('Vendor profile not found');
      }

      const { data, error } = await supabase
        .from('activity_mapped')
        .select(`
          id,
          activity_mapping_id,
          message,
          created_at,
          activities (
            brand,
            city,
            location,
            start_date,
            end_date,
            activity_description
          )
        `)
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyActivities(data || []);
    } catch (error) {
      console.error('Error fetching my activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your activities. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Activities</h1>
          <p className="text-muted-foreground">
            View all activities assigned to you
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : myActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities have been assigned to you yet.
          </div>
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
                  <TableHead>Description</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Assigned On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.activities.brand}</TableCell>
                    <TableCell>{activity.activities.city}</TableCell>
                    <TableCell>{activity.activities.location}</TableCell>
                    <TableCell>
                      {format(new Date(activity.activities.start_date), 'PPP')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(activity.activities.end_date), 'PPP')}
                    </TableCell>
                    <TableCell>{activity.activities.activity_description || '-'}</TableCell>
                    <TableCell>{activity.message || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(activity.created_at), 'PPP')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}