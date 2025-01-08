import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { ActivityLoading } from "@/components/activities/ActivityLoading";
import { ActivityDetailsCard } from "@/components/activities/ActivityDetailsCard";
import { ActivityDetail } from "@/types/activities";
import { fetchActivityDetails, startWork } from "@/services/activityService";
import { useWorkStatus } from "@/hooks/useWorkStatus";

export default function ActivityDetailPage() {
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workStarted, isLoading: workStatusLoading } = useWorkStatus(id || '');

  useEffect(() => {
    if (!id) {
      setError("Activity ID is required");
      return;
    }
    loadActivityDetails(id);
  }, [id]);

  const loadActivityDetails = async (activityId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const activityData = await fetchActivityDetails(activityId);
      setActivity(activityData);
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
      if (!activity) return;
      await startWork(activity);
      toast({
        title: "Success",
        description: "Work has been started for the activity",
      });
      // Refresh work status after starting work
      window.location.reload();
    } catch (error) {
      console.error('Error starting work:', error);
      toast({
        title: "Error",
        description: "Failed to start work",
        variant: "destructive",
      });
    }
  };

  if (isLoading || workStatusLoading) {
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