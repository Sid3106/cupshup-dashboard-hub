import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityWithCreator } from "@/types/activities";
import { AssignActivityDialog } from "./AssignActivityDialog";

interface ActivityCardProps {
  activity: ActivityWithCreator;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{activity.brand}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{activity.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{activity.location}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {format(new Date(activity.start_date), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created By</p>
              <p className="font-medium">{activity.creator_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Activity ID</p>
              <p className="text-sm font-medium text-muted-foreground">{activity.activity_id}</p>
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={() => setShowAssignDialog(true)}
          >
            Assign
          </Button>
        </CardContent>
      </Card>

      <AssignActivityDialog
        activity={activity}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
      />
    </>
  );
}