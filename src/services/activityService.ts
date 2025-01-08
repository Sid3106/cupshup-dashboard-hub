import { supabase } from "@/integrations/supabase/client";
import { ActivityDetail } from "@/types/activities";

export const fetchActivityDetails = async (activityId: string): Promise<ActivityDetail> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (vendorError) throw vendorError;
  if (!vendorData) throw new Error("Vendor profile not found");

  const { data: mappedActivity, error: mappedError } = await supabase
    .from('activity_mapped')
    .select(`
      created_at,
      message,
      activities (
        id,
        brand,
        city,
        location,
        start_date,
        end_date,
        activity_description,
        created_by
      )
    `)
    .eq('activity_id', activityId)
    .eq('vendor_id', vendorData.id)
    .maybeSingle();

  if (mappedError) throw mappedError;
  if (!mappedActivity?.activities) {
    throw new Error("Activity not found or you don't have access to it");
  }

  const { data: creatorProfile, error: creatorError } = await supabase
    .from('profiles')
    .select('name')
    .eq('user_id', mappedActivity.activities.created_by)
    .maybeSingle();

  if (creatorError) throw creatorError;

  return {
    ...mappedActivity.activities,
    creator_name: creatorProfile?.name || 'Unknown',
    mapping: {
      created_at: mappedActivity.created_at,
      message: mappedActivity.message
    }
  };
};

export const startWork = async (activity: ActivityDetail) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error("Authentication required");

  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (vendorError) throw vendorError;
  if (!vendorData) throw new Error("Vendor data not found");

  const { error: insertError } = await supabase
    .from('task_mapping')
    .insert({
      activity_id: activity.id,
      brand: activity.brand,
      city: activity.city,
      location: activity.location,
      start_date: activity.start_date,
      end_date: activity.end_date,
      vendor_name: vendorData.vendor_name,
      vendor_email: vendorData.vendor_email,
      start_work_time: new Date().toLocaleTimeString('en-US', { hour12: false })
    });

  if (insertError) throw insertError;
};