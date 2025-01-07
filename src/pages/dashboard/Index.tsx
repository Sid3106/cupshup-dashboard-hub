import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Store, Building2, CalendarDays, TestTube } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardPage() {
  // Query for users count
  const { data: usersCount = 0 } = useQuery({
    queryKey: ['usersCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Query for vendors count
  const { data: vendorsCount = 0 } = useQuery({
    queryKey: ['vendorsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Query for clients count
  const { data: clientsCount = 0 } = useQuery({
    queryKey: ['clientsCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Query for activities count
  const { data: activitiesCount = 0 } = useQuery({
    queryKey: ['activitiesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Query for test entries count
  const { data: testCount = 0 } = useQuery({
    queryKey: ['testCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('test')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Subscribe to activity assignments
  useEffect(() => {
    const channel = supabase
      .channel('activity-assignments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_mapped'
        },
        (payload) => {
          // Show notification for new activity assignments
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Activity Assignment', {
              body: 'An activity is assigned to you',
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your CupShup dashboard
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={usersCount}
            icon={Users}
            description="Registered users"
          />
          <StatsCard
            title="Vendors"
            value={vendorsCount}
            icon={Store}
            description="Active vendors"
          />
          <StatsCard
            title="Clients"
            value={clientsCount}
            icon={Building2}
            description="Total clients"
          />
          <StatsCard
            title="Activities"
            value={activitiesCount}
            icon={CalendarDays}
            description="Total activities"
          />
        </div>

        <div className="mt-8">
          <StatsCard
            title="Test Entries"
            value={testCount}
            icon={TestTube}
            description="Total test entries"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}