export interface ActivityFormData {
  brand: string;
  city: string;
  location: string;
  start_date: Date;
  end_date: Date;
  latitude?: number;
  longitude?: number;
  contract_value?: number;
  activity_description?: string;
}