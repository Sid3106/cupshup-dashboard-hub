import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import { ActivityLoading } from "@/components/activities/ActivityLoading";

interface ActivityDetail {
  id: string;
  brand: string;
  city: string;
  location: string;
  start_date: string;
  end_date: string;
  activity_description: string | null;
  creator_name?: string;
  mapping?: {
    created_at: string;
    message: string | null;
  };
}

export default function ActivityDetailPage() {
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setError("Activity ID is required");
      return;
    }
    fetchActivityDetails(id);
  }, [id]);

  const fetchActivityDetails = async (activityId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the vendor's ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Authentication required");
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (vendorError) throw vendorError;
      if (!vendorData) throw new Error("Vendor profile not found");

      // Then fetch the activity details with the mapping
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
        .single();

      if (mappedError) throw mappedError;
      if (!mappedActivity?.activities) {
        throw new Error("Activity not found or you don't have access to it");
      }

      // Fetch creator's profile
      const { data: creatorProfile, error: creatorError } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', mappedActivity.activities.created_by)
        .single();

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

  const handleStartWork = () => {
    toast({
      title: "Success",
      description: "Work started successfully!",
    });
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

        <Card>
          <CardHeader>
            <CardTitle>{activity.brand}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{activity.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{activity.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {format(new Date(activity.start_date), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {format(new Date(activity.end_date), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="font-medium">{activity.creator_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned On</p>
                <p className="font-medium">
                  {activity.mapping?.created_at 
                    ? format(new Date(activity.mapping.created_at), 'PPP')
                    : 'N/A'}
                </p>
              </div>
            </div>

            {activity.activity_description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{activity.activity_description}</p>
              </div>
            )}

            {activity.mapping?.message && (
              <div>
                <p className="text-sm text-muted-foreground">Assignment Message</p>
                <p className="font-medium">{activity.mapping.message}</p>
              </div>
            )}

            <div className="pt-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleStartWork}
              >
                Start Work
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}