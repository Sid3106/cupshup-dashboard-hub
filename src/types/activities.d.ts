export interface MyActivity {
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

export interface ActivityTableProps {
  activities: MyActivity[];
  onRowClick: (activityId: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}