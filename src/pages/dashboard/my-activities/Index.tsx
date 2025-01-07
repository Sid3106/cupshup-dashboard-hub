import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MyActivitiesContent } from "@/components/activities/MyActivitiesContent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import type { MyActivity } from "@/types/activities";

export default function MyActivitiesPage() {
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const user = useUser();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchMyActivities();
    }
  }, [user, currentPage]);

  const fetchMyActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        setError("User not found");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Profile data:', profileData);

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

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Vendor data:', vendorData);

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        throw vendorError;
      }

      if (!vendorData?.id) {
        setError("Vendor profile not found. Please go to your profile page and click 'Trigger Vendor Creation'.");
        toast({
          title: "Action Required",
          description: "Please visit your profile page and click 'Trigger Vendor Creation' to complete your vendor setup.",
          variant: "destructive",
        });
        return;
      }

      const { count, error: countError } = await supabase
        .from('activity_mapped')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorData.id);

      if (countError) {
        console.error('Error getting count:', countError);
        throw countError;
      }

      if (count !== null) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

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

      if (mappedError) {
        console.error('Error fetching mapped activities:', mappedError);
        throw mappedError;
      }

      if (!mappedActivities || mappedActivities.length === 0) {
        setMyActivities([]);
        setError("No activities have been assigned to you yet.");
        return;
      }

      const creatorIds = [...new Set(mappedActivities
        .map(activity => activity.activities?.created_by)
        .filter(Boolean))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', creatorIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const profileMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile.name]) || []
      );

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

        <MyActivitiesContent
          isLoading={isLoading}
          error={error}
          myActivities={myActivities}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onRowClick={handleRowClick}
        />
      </div>
    </DashboardLayout>
  );
}