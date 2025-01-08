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
}

export interface MyActivity {
  id: string;
  activity_id: string;
  activities: Activity;
  vendor_id: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  message: string | null;
  assigned_by: string;
  created_at: string;
  updated_at: string;
  activity_mapping_id: string | null;
  creator_name: string;
}

export interface ActivityTableProps {
  activities: MyActivity[];
  onRowClick: (id: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}