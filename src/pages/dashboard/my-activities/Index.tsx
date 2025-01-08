import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MyActivitiesTable } from "@/components/activities/MyActivitiesTable";
import { ActivityPagination } from "@/components/activities/ActivityPagination";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { MyActivity } from "@/types/activities";

export default function MyActivitiesPage() {
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    checkSession();
    fetchMyActivities();
  }, [currentPage]);

  const checkSession = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      navigate('/auth');
      return;
    }
  };

  const fetchMyActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setError("Please sign in to view your activities");
        return;
      }

      // First check if a vendor profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        setError("User profile not found. Please complete your profile setup.");
        return;
      }

      if (profileData.role !== 'Vendor') {
        setError("This page is only accessible to vendors.");
        return;
      }

      // Get the vendor ID
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        throw vendorError;
      }

      if (!vendorData?.id) {
        setError("Vendor profile not found. Please contact support.");
        return;
      }

      // Get the total count
      const { count, error: countError } = await supabase
        .from('activity_mapped')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorData.id);

      if (countError) throw countError;

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

      if (mappedError) throw mappedError;

      if (!mappedActivities || mappedActivities.length === 0) {
        setMyActivities([]);
        setError("No activities have been assigned to you yet.");
        return;
      }

      // Get creator profiles
      const creatorIds = [...new Set(mappedActivities
        .map(activity => activity.activities?.created_by)
        .filter(Boolean))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', creatorIds);

      if (profilesError) throw profilesError;

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
      console.error('Error in fetchMyActivities:', error);
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
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        ) : myActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities have been assigned to you yet.
          </div>
        ) : (
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
        )}
      </div>
    </DashboardLayout>
  );
}