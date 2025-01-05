import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];

export default function VendorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_email: "",
    vendor_phone: "",
    city: "",
  });

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setCurrentUserRole(profile?.role || null);
      }
    };

    const fetchVendorDetails = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setVendor(data);
        setFormData({
          vendor_name: data.vendor_name,
          vendor_email: data.vendor_email,
          vendor_phone: data.vendor_phone,
          city: data.city || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch vendor details",
          variant: "destructive",
        });
        navigate('/dashboard/vendors');
      }
    };

    fetchCurrentUserRole();
    fetchVendorDetails();
  }, [id, navigate, toast]);

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor details updated successfully",
      });
      setIsEditing(false);
      setVendor({ ...vendor!, ...formData });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor details",
        variant: "destructive",
      });
    }
  };

  if (currentUserRole !== "CupShup") {
    return (
      <DashboardLayout>
        <div className="text-center mt-8">
          You don't have permission to access this page.
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div className="text-center mt-8">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/vendors')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Vendor Details</h2>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-2xl font-semibold">{vendor.vendor_name}</h3>
            <Button
              onClick={() => {
                if (isEditing) {
                  handleUpdate();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? "Save Changes" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vendor_name">Vendor Name</Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vendor_email">Email</Label>
                  <Input
                    id="vendor_email"
                    type="email"
                    value={formData.vendor_email}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor_email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vendor_phone">Phone Number</Label>
                  <Input
                    id="vendor_phone"
                    value={formData.vendor_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor_phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{vendor.vendor_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p>{vendor.vendor_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p>{vendor.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p>{new Date(vendor.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}