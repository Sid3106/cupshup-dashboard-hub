import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MyActivity } from "@/types/activities";

export const useVendorActivities = (currentPage: number, itemsPerPage: number) => {
  const [activities, setActivities] = useState<MyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendorActivities();
  }, [currentPage]);

  const fetchVendorActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        setError("Authentication required. Please sign in again.");
        return;
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        throw vendorError;
      }

      if (!vendorData?.id) {
        setError("Vendor profile not found. Please contact support.");
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
        setActivities([]);
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

      setActivities(transformedActivities);
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

  return { activities, isLoading, error, totalPages };
};