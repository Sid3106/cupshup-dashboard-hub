import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityDetail } from "@/types/activities";
import { TaskFormDialog } from "./TaskFormDialog";

interface ActivityDetailsCardProps {
  activity: ActivityDetail;
  workStarted: boolean;
  onStartWork: () => void;
}

export const ActivityDetailsCard = ({ 
  activity, 
  workStarted, 
  onStartWork 
}: ActivityDetailsCardProps) => {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const handleButtonClick = () => {
    if (workStarted) {
      setIsTaskFormOpen(true);
    } else {
      onStartWork();
    }
  };

  return (
    <>
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
                {activity.start_date && format(new Date(activity.start_date), 'PPP')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">
                {activity.end_date && format(new Date(activity.end_date), 'PPP')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">{activity.creator_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned On</p>
              <p className="font-medium">
                {activity.mapping?.created_at && format(new Date(activity.mapping.created_at), 'PPP')}
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
              onClick={handleButtonClick}
            >
              {workStarted ? "Add Task" : "Start Work"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <TaskFormDialog 
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        activityId={activity.id}
      />
    </>
  );
};