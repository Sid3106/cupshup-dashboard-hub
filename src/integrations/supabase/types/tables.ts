import { IndianCity, UserRole, BrandName } from './enums';

interface BaseTable {
  created_at: string;
  updated_at: string;
}

export interface Profile extends BaseTable {
  id: string;
  user_id: string;
  role: UserRole;
  phone_number: string;
  photo_url: string | null;
  city: IndianCity | null;
  name: string | null;
}

export interface Client extends BaseTable {
  id: string;
  brand_name: BrandName;
  client_name: string;
  client_email: string;
  client_phone: string;
  city: IndianCity | null;
  user_id: string | null;
}

export interface Vendor extends BaseTable {
  id: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  city: string | null;
  user_id: string | null;
}