import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        navigate("/auth");
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!profile) {
          toast({
            title: "Profile not found",
            description: "Please contact an administrator to set up your profile.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        setCurrentUserRole(profile.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user role. Please try again later.",
          variant: "destructive",
        });
      }
    };

    const fetchVendors = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVendors(data || []);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast({
          title: "Error",
          description: "Failed to fetch vendors",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUserRole();
    fetchVendors();
  }, [navigate, toast]);

  if (currentUserRole !== "CupShup") {
    return (
      <DashboardLayout>
        <div className="text-center mt-8">
          You don't have permission to access this page.
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center mt-8">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
          <p className="text-muted-foreground">
            Manage your vendors and their information
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/dashboard/vendors/${vendor.id}`)}
            >
              <h3 className="font-semibold text-lg mb-2">{vendor.vendor_name}</h3>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Email: {vendor.vendor_email}</p>
                <p>Phone: {vendor.vendor_phone}</p>
                <p>City: {vendor.city || 'N/A'}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}