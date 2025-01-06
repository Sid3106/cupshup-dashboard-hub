import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActivityBasicFields } from "./form/ActivityBasicFields";
import { ActivityDateFields } from "./form/ActivityDateFields";
import { ActivityOptionalFields } from "./form/ActivityOptionalFields";
import { ActivityFormData } from "./types";
import { useSession } from "@supabase/auth-helpers-react";

interface CreateActivityFormProps {
  onSuccess: () => void;
}

export function CreateActivityForm({ onSuccess }: CreateActivityFormProps) {
  const { toast } = useToast();
  const form = useForm<ActivityFormData>();
  const session = useSession();

  // Fetch brands from clients table
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('brand_name');
      
      if (error) throw error;
      
      // Extract unique brand names from the response
      const uniqueBrands = [...new Set(data.map(d => d.brand_name))];
      return uniqueBrands;
    }
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('activities')
        .insert({
          ...data,
          start_date: data.start_date.toISOString(),
          end_date: data.end_date.toISOString(),
          created_by: session.user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ActivityBasicFields form={form} brands={brands} />
        <ActivityDateFields form={form} />
        <ActivityOptionalFields form={form} />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}