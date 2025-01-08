export interface Activity {
  id: string;
  activity_id: string | null;
  brand: string;
  city: string;
  location: string;
  start_date: string;
  end_date: string;
  latitude: number | null;
  longitude: number | null;
  contract_value: number | null;
  activity_description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  creator?: {
    name: string | null;
  };
}

export interface ActivityWithCreator extends Activity {
  creator_name: string;
}

export interface MyActivity {
  id: string;
  activity_mapping_id: string | null;
  activities: {
    id: string;
    brand: string;
    city: string;
    location: string;
    start_date: string;
    created_by: string;
  };
  created_at: string;
  creator_name: string;
}

export interface ActivityTableProps {
  activities: MyActivity[];
  onRowClick?: (id: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}