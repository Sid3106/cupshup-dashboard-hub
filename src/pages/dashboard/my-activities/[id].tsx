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
    if (id) {
      fetchActivityDetails();
    }
  }, [id]);

  const fetchActivityDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select(`
          *,
          activity_mapped (
            created_at,
            message
          )
        `)
        .eq('id', id)
        .single();

      if (activityError) throw activityError;

      if (!activityData) {
        setError("Activity not found");
        return;
      }

      // Fetch creator profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', activityData.created_by)
        .single();

      if (profileError) throw profileError;

      setActivity({
        ...activityData,
        creator_name: profileData?.name || 'Unknown',
        mapping: activityData.activity_mapped?.[0]
      });
    } catch (error) {
      console.error('Error fetching activity details:', error);
      setError("Failed to fetch activity details. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch activity details. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWork = () => {
    // TODO: Implement start work functionality
    toast({
      title: "Success",
      description: "Work started successfully!",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading activity details...</div>
      </DashboardLayout>
    );
  }

  if (error || !activity) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>{error || "Activity not found"}</AlertDescription>
        </Alert>
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