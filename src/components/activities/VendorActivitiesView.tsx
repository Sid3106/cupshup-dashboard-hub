import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyActivitiesTable } from "./MyActivitiesTable";
import { ActivityPagination } from "./ActivityPagination";
import { ActivityLoading } from "./ActivityLoading";
import { ActivityError } from "./ActivityError";
import { useVendorActivities } from "@/hooks/useVendorActivities";

export const VendorActivitiesView = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const { activities, isLoading, error, totalPages } = useVendorActivities(currentPage, itemsPerPage);

  const handleRowClick = (activityId: string) => {
    navigate(`/dashboard/my-activities/${activityId}`);
  };

  if (isLoading) {
    return <ActivityLoading />;
  }

  if (error) {
    return <ActivityError message={error} />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activities have been assigned to you yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <MyActivitiesTable 
          activities={activities} 
          onRowClick={handleRowClick}
        />
      </div>

      <ActivityPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};