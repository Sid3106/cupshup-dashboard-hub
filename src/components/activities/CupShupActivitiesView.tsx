import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityCard } from "./ActivityCard";
import { supabase } from "@/integrations/supabase/client";
import { ActivityWithCreator } from "@/types/activities";
import { CITIES } from "@/constants/formOptions";

export function CupShupActivitiesView() {
  const [activities, setActivities] = useState<ActivityWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    fetchBrands();
    fetchActivities();
  }, [selectedCity, selectedBrand]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('brand_name')
        .order('brand_name');

      if (error) throw error;

      const uniqueBrands = [...new Set(data.map(client => client.brand_name))];
      setBrands(uniqueBrands);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_created_by_fkey (
            name
          )
        `)
        .order('start_date', { ascending: false });

      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }

      if (selectedBrand) {
        query = query.eq('brand', selectedBrand);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData: ActivityWithCreator[] = data.map(activity => ({
        ...activity,
        creator_name: activity.profiles?.name || 'Unknown'
      }));

      setActivities(transformedData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
              <SelectItem value="">All Cities</SelectItem>
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
              <SelectItem value="">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
    </div>
  );
}