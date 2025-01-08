import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { VendorActivitiesView } from "@/components/activities/VendorActivitiesView";

export default function MyActivitiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Activities</h1>
          <p className="text-muted-foreground">
            View all activities assigned to you
          </p>
        </div>

        <VendorActivitiesView />
      </div>
    </DashboardLayout>
  );
}