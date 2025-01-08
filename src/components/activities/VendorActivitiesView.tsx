import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MyActivitiesTable } from "./MyActivitiesTable";
import { ActivityPagination } from "./ActivityPagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MyActivity } from "@/types/activities";

export const VendorActivitiesView = () => {
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVendorActivities();
  }, [currentPage]);

  const fetchVendorActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        setError("Authentication required. Please sign in again.");
        return;
      }

      // Get the vendor ID using the user_id
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      console.log('Vendor data:', vendorData);

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        throw vendorError;
      }

      if (!vendorData?.id) {
        setError("Vendor profile not found. Please contact support.");
        return;
      }

      // Get the total count of mapped activities for this vendor
      const { count, error: countError } = await supabase
        .from('activity_mapped')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorData.id);

      console.log('Activity count:', count);

      if (countError) {
        console.error('Error getting count:', countError);
        throw countError;
      }

      if (count !== null) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch activities with pagination
      const { data: mappedActivities, error: mappedError } = await supabase
        .from('activity_mapped')
        .select(`
          id,
          activity_mapping_id,
          created_at,
          activities (
            id,
            brand,
            city,
            location,
            start_date,
            created_by
          )
        `)
        .eq('vendor_id', vendorData.id)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      console.log('Mapped activities:', mappedActivities);

      if (mappedError) {
        console.error('Error fetching mapped activities:', mappedError);
        throw mappedError;
      }

      if (!mappedActivities || mappedActivities.length === 0) {
        setMyActivities([]);
        setError("No activities have been assigned to you yet.");
        return;
      }

      // Get unique creator IDs
      const creatorIds = [...new Set(mappedActivities
        .map(activity => activity.activities?.created_by)
        .filter(Boolean))];

      console.log('Creator IDs:', creatorIds);

      // Fetch creator profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', creatorIds);

      console.log('Creator profiles:', profilesData);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of user_id to profile name
      const profileMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile.name]) || []
      );

      // Transform the data
      const transformedActivities = mappedActivities
        .filter(activity => activity.activities)
        .map(activity => ({
          ...activity,
          creator_name: activity.activities?.created_by 
            ? profileMap.get(activity.activities.created_by) || 'Unknown'
            : 'Unknown'
        }));

      setMyActivities(transformedActivities);
      setError(null);
    } catch (error) {
      console.error('Error in fetchVendorActivities:', error);
      setError("Failed to fetch your activities. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch your activities. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (activityId: string) => {
    navigate(`/dashboard/my-activities/${activityId}`);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
      </Alert>
    );
  }

  if (myActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activities have been assigned to you yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <MyActivitiesTable 
          activities={myActivities} 
          onRowClick={handleRowClick}
        />
      </div>

      <ActivityPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};