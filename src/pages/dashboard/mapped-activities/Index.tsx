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

interface MappedActivity {
  activity_mapping_id: string;
  vendor_name: string;
  activities: {
    brand: string;
    city: string;
    location: string;
    start_date: string;
  };
}

export default function MappedActivitiesPage() {
  const [mappedActivities, setMappedActivities] = useState<MappedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMappedActivities();
  }, []);

  const fetchMappedActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_mapped')
        .select(`
          activity_mapping_id,
          vendor_name,
          activities (
            brand,
            city,
            location,
            start_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMappedActivities(data || []);
    } catch (error) {
      console.error('Error fetching mapped activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mapped activities. Please try again later.",
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
          <h1 className="text-2xl font-bold">Mapped Activities</h1>
          <p className="text-muted-foreground">
            View all activities that have been mapped to vendors
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading mapped activities...</div>
        ) : mappedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No mapped activities found.
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
                  <TableHead>Vendor Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedActivities.map((activity) => (
                  <TableRow key={activity.activity_mapping_id}>
                    <TableCell>{activity.activities.brand}</TableCell>
                    <TableCell>{activity.activities.city}</TableCell>
                    <TableCell>{activity.activities.location}</TableCell>
                    <TableCell>
                      {format(new Date(activity.activities.start_date), 'PPP')}
                    </TableCell>
                    <TableCell>{activity.vendor_name}</TableCell>
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