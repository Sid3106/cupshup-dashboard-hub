import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  email?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileData) {
            setProfile({
              ...profileData,
              email: session.user.email
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const triggerVendorCreation = async () => {
    try {
      if (!profile) return;

      const { error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor profile creation triggered. Please refresh the page.",
      });
    } catch (error) {
      console.error('Error triggering vendor creation:', error);
      toast({
        title: "Error",
        description: "Failed to trigger vendor creation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div>Profile not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <Avatar className="h-24 w-24">
              {profile.photo_url ? (
                <AvatarImage src={profile.photo_url} alt={profile.name || ''} />
              ) : (
                <AvatarFallback className="text-2xl bg-[#00A979] text-white">
                  {profile.name
                    ?.split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <h3 className="text-2xl font-semibold">{profile.name}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <p className="mt-1">{profile.phone_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">City</label>
              <p className="mt-1">{profile.city || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1">{profile.role}</p>
            </div>
            {profile.role === 'Vendor' && (
              <div className="pt-4">
                <Button onClick={triggerVendorCreation}>
                  Trigger Vendor Creation
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}