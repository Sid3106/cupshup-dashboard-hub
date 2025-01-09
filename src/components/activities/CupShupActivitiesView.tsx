import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ActivityCard } from "./ActivityCard";
import { CreateActivityDialog } from "./CreateActivityDialog";
import { supabase } from "@/integrations/supabase/client";
import { ActivityWithCreator } from "@/types/activities";
import { CITIES, BRANDS } from "@/constants/formOptions";
import { toast } from "sonner";

export function CupShupActivitiesView() {
  const [activities, setActivities] = useState<ActivityWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [selectedCity, selectedBrand]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('activities')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .order('start_date', { ascending: false });

      if (selectedCity && selectedCity !== "_all") {
        query = query.eq('city', selectedCity);
      }

      if (selectedBrand && selectedBrand !== "_all") {
        query = query.eq('brand', selectedBrand);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      if (!data) {
        setActivities([]);
        return;
      }

      const transformedData: ActivityWithCreator[] = data.map(activity => ({
        ...activity,
        creator_name: activity.profiles?.name || 'Unknown'
      }));

      setActivities(transformedData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error("Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="w-48">
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Cities</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select
              value={selectedBrand}
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Brands</SelectItem>
                {Object.values(BRANDS).map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#00A979] hover:bg-[#00A979]/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Activity
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No activities found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      <CreateActivityDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchActivities}
      />
    </div>
  );
}