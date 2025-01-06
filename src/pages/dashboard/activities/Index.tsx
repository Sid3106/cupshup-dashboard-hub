import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateActivityDialog } from "@/components/activities/CreateActivityDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ActivitiesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Activity
        </Button>
      </div>

      <CreateActivityDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </DashboardLayout>
  );
}