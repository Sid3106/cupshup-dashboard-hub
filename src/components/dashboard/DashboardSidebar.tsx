import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { DashboardNavLink } from "./navigation/DashboardNavLink";
import { VendorNavigation } from "./navigation/VendorNavigation";
import { CupShupNavigation } from "./navigation/CupShupNavigation";

export function DashboardSidebar() {
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      console.log('User profile:', data); // Add logging to debug role
      return data;
    },
  });

  const isVendor = userProfile?.role === 'Vendor';
  const isCupShup = userProfile?.role === 'CupShup';

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col gap-4 bg-primary text-white p-4">
        <DashboardNavLink />
        {isVendor && <VendorNavigation />}
        {isCupShup && <CupShupNavigation />}
      </SidebarContent>
    </Sidebar>
  );
}