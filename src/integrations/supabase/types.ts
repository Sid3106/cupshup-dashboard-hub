export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          activity_description: string | null
          activity_id: string | null
          brand: string
          city: string
          contract_value: number | null
          created_at: string
          created_by: string
          end_date: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          start_date: string
          updated_at: string
        }
        Insert: {
          activity_description?: string | null
          activity_id?: string | null
          brand: string
          city: string
          contract_value?: number | null
          created_at?: string
          created_by: string
          end_date: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          start_date: string
          updated_at?: string
        }
        Update: {
          activity_description?: string | null
          activity_id?: string | null
          brand?: string
          city?: string
          contract_value?: number | null
          created_at?: string
          created_by?: string
          end_date?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_mapped: {
        Row: {
          activity_id: string
          assigned_by: string
          created_at: string
          id: string
          message: string | null
          updated_at: string
          vendor_email: string
          vendor_id: string
          vendor_name: string
          vendor_phone: string
        }
        Insert: {
          activity_id: string
          assigned_by: string
          created_at?: string
          id?: string
          message?: string | null
          updated_at?: string
          vendor_email: string
          vendor_id: string
          vendor_name: string
          vendor_phone: string
        }
        Update: {
          activity_id?: string
          assigned_by?: string
          created_at?: string
          id?: string
          message?: string | null
          updated_at?: string
          vendor_email?: string
          vendor_id?: string
          vendor_name?: string
          vendor_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_mapped_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_mapped_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          brand_name: Database["public"]["Enums"]["brand_name"]
          city: Database["public"]["Enums"]["indian_city"] | null
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          brand_name: Database["public"]["Enums"]["brand_name"]
          city?: Database["public"]["Enums"]["indian_city"] | null
          client_email: string
          client_name: string
          client_phone: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          brand_name?: Database["public"]["Enums"]["brand_name"]
          city?: Database["public"]["Enums"]["indian_city"] | null
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
        Relationships: []
      }
      vendors: {
        Row: {
          city: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
          vendor_email: string
          vendor_name: string
          vendor_phone: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          vendor_email: string
          vendor_name: string
          vendor_phone: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          vendor_email?: string
          vendor_name?: string
          vendor_phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      brand_name:
        | "Flipkart"
        | "DCB Bank"
        | "VLCC"
        | "Spencers"
        | "Unity Bank"
        | "Tata 1mg"
        | "Sleepwell"
        | "HDFC Life"
        | "Farmrise"
        | "Natures Basket"
      indian_city:
        | "Mumbai"
        | "Delhi"
        | "Noida"
        | "Gurgaon"
        | "Pune"
        | "Kolkata"
        | "Bengaluru"
        | "Jaipur"
        | "Ahmedabad"
        | "Chennai"
      user_role: "CupShup" | "Client" | "Vendor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
