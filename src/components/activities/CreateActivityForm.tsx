import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActivityBasicFields } from "./form/ActivityBasicFields";
import { ActivityDateFields } from "./form/ActivityDateFields";
import { ActivityOptionalFields } from "./form/ActivityOptionalFields";
import { BrandName } from "@/integrations/supabase/types/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CreateActivityFormProps {
  onSuccess: () => void;
}

export const formSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  start_date: z.date(),
  end_date: z.date(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contract_value: z.number().optional(),
  activity_description: z.string().optional()
});

export type FormData = z.infer<typeof formSchema>;

const BRAND_OPTIONS: BrandName[] = [
  "Flipkart",
  "DCB Bank",
  "VLCC",
  "Spencers",
  "Unity Bank",
  "Tata 1mg",
  "Sleepwell",
  "HDFC Life",
  "Farmrise",
  "Natures Basket"
];

export function CreateActivityForm({ onSuccess }: CreateActivityFormProps) {
  const { toast } = useToast();
  const user = useUser();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      city: "",
      location: "",
      start_date: new Date(),
      end_date: new Date(),
      latitude: undefined,
      longitude: undefined,
      contract_value: undefined,
      activity_description: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create an activity",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('activities')
        .insert({
          brand: data.brand,
          city: data.city,
          location: data.location,
          start_date: data.start_date.toISOString(),
          end_date: data.end_date.toISOString(),
          latitude: data.latitude,
          longitude: data.longitude,
          contract_value: data.contract_value,
          activity_description: data.activity_description,
          created_by: user.id,
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
        <ActivityBasicFields form={form} brands={BRAND_OPTIONS} />
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