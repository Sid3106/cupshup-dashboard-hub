import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import { ActivityLoading } from "@/components/activities/ActivityLoading";
import { ActivityDetailsCard } from "@/components/activities/ActivityDetailsCard";
import { ActivityDetail } from "@/types/activities";

export default function ActivityDetailPage() {
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workStarted, setWorkStarted] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setError("Activity ID is required");
      return;
    }
    fetchActivityDetails(id);
    checkIfWorkStarted(id);
  }, [id]);

  const checkIfWorkStarted = async (activityId: string) => {
    try {
      const { data: taskData } = await supabase
        .from('task_mapping')
        .select('*')
        .eq('activity_id', activityId)
        .maybeSingle();
      
      setWorkStarted(!!taskData);
    } catch (error) {
      console.error('Error checking work status:', error);
      setWorkStarted(false);
    }
  };

  const fetchActivityDetails = async (activityId: string) => {
    try {
      setIsLoading(true);
      setError(null);

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

      setActivity({
        ...mappedActivity.activities,
        creator_name: creatorProfile?.name || 'Unknown',
        mapping: {
          created_at: mappedActivity.created_at,
          message: mappedActivity.message
        }
      });
    } catch (error) {
      console.error('Error fetching activity details:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch activity details";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id || !activity) return;

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

      setWorkStarted(true);
      toast({
        title: "Success",
        description: "Work has been started for the activity",
      });
    } catch (error) {
      console.error('Error starting work:', error);
      toast({
        title: "Error",
        description: "Failed to start work",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <ActivityLoading />
      </DashboardLayout>
    );
  }

  if (error || !activity) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/my-activities')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Activity Details</h1>
          </div>
          <Alert variant="destructive">
            <AlertDescription>{error || "Activity not found"}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/my-activities')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Activity Details</h1>
        </div>

        <ActivityDetailsCard 
          activity={activity}
          workStarted={workStarted}
          onStartWork={handleStartWork}
        />
      </div>
    </DashboardLayout>
  );
}