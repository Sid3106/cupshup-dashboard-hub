import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@supabase/auth-helpers-react";

interface MyActivity {
  id: string;
  activity_mapping_id: string;
  created_at: string;
  activities: {
    id: string;
    brand: string;
    city: string;
    location: string;
    start_date: string;
    created_by: string;
  };
  creator_name?: string;
}

export default function MyActivitiesPage() {
  const [myActivities, setMyActivities] = useState<MyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const user = useUser();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchMyActivities();
    }
  }, [user, currentPage]);

  const fetchMyActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.email) {
        setError("User email not found");
        return;
      }

      // First get the total count
      const { count } = await supabase
        .from('activity_mapped')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_email', user.email);

      if (count !== null) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch paginated activities with their details
      const { data: mappedActivities, error: mappedError } = await supabase
        .from('activity_mapped')
        .select(`
          id,
          activity_mapping_id,
          created_at,
          activities (
            id,
            brand,
            city,
            location,
            start_date,
            created_by
          )
        `)
        .eq('vendor_email', user.email)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (mappedError) {
        console.error('Error fetching mapped activities:', mappedError);
        throw mappedError;
      }

      if (!mappedActivities) {
        setMyActivities([]);
        return;
      }

      // Get unique creator IDs
      const creatorIds = [...new Set(mappedActivities
        .map(activity => activity.activities?.created_by)
        .filter(Boolean))];

      // Fetch creator profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', creatorIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of user_id to profile name
      const profileMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile.name]) || []
      );

      // Transform the data
      const transformedActivities = mappedActivities
        .filter(activity => activity.activities) // Filter out any null activities
        .map(activity => ({
          ...activity,
          creator_name: activity.activities?.created_by 
            ? profileMap.get(activity.activities.created_by) || 'Unknown'
            : 'Unknown'
        }));

      console.log('Transformed activities:', transformedActivities);
      setMyActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching my activities:', error);
      setError("Failed to fetch your activities. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch your activities. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (activityId: string) => {
    navigate(`/dashboard/my-activities/${activityId}`);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return pages;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Activities</h1>
          <p className="text-muted-foreground">
            View all activities assigned to you
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : myActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities have been assigned to you yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Assigned On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myActivities.map((activity) => (
                    <TableRow 
                      key={activity.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleRowClick(activity.activities.id)}
                    >
                      <TableCell>{activity.activities.brand}</TableCell>
                      <TableCell>{activity.activities.city}</TableCell>
                      <TableCell>{activity.activities.location}</TableCell>
                      <TableCell>
                        {format(new Date(activity.activities.start_date), 'PPP')}
                      </TableCell>
                      <TableCell>{activity.creator_name}</TableCell>
                      <TableCell>
                        {format(new Date(activity.created_at), 'PPP')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}