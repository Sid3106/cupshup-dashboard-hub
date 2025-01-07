import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MyActivitiesTable } from "./MyActivitiesTable";
import { ActivityPagination } from "./ActivityPagination";
import type { MyActivity } from "@/types/activities";

interface MyActivitiesContentProps {
  isLoading: boolean;
  error: string | null;
  myActivities: MyActivity[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick: (activityId: string) => void;
}

export const MyActivitiesContent = ({
  isLoading,
  error,
  myActivities,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
}: MyActivitiesContentProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (myActivities.length === 0) {
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
          activities={myActivities} 
          onRowClick={onRowClick}
        />
      </div>

      <ActivityPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};