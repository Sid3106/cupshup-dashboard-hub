export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          city: Database["public"]["Enums"]["indian_city"] | null
          created_at: string
          id: string
          name: string | null
          phone_number: string
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: Database["public"]["Enums"]["indian_city"] | null
          created_at?: string
          id?: string
          name?: string | null
          phone_number: string
          photo_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: Database["public"]["Enums"]["indian_city"] | null
          created_at?: string
          id?: string
          name?: string | null
          phone_number?: string
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
      }
      clients: {
        Row: {
          id: string
          brand_name: Database["public"]["Enums"]["brand_name"]
          client_name: string
          client_email: string
          client_phone: string
          city: Database["public"]["Enums"]["indian_city"] | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_name: Database["public"]["Enums"]["brand_name"]
          client_name: string
          client_email: string
          client_phone: string
          city?: Database["public"]["Enums"]["indian_city"] | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_name?: Database["public"]["Enums"]["brand_name"]
          client_name?: string
          client_email?: string
          client_phone?: string
          city?: Database["public"]["Enums"]["indian_city"] | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      indian_city: "Mumbai" | "Delhi" | "Noida" | "Gurgaon" | "Pune" | "Kolkata" | "Bengaluru" | "Jaipur" | "Ahmedabad" | "Chennai"
      user_role: "CupShup" | "Client" | "Vendor"
      brand_name: "Flipkart" | "DCB Bank" | "VLCC" | "Spencers" | "Unity Bank" | "Tata 1mg" | "Sleepwell" | "HDFC Life" | "Farmrise" | "Natures Basket"
    }
  }
}