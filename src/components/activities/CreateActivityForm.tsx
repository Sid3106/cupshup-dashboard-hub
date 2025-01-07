import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ActivityBasicFields } from "./form/ActivityBasicFields";
import { ActivityDateFields } from "./form/ActivityDateFields";
import { ActivityOptionalFields } from "./form/ActivityOptionalFields";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BrandName } from "@/integrations/supabase/types/enums";

interface CreateActivityFormProps {
  onSuccess: () => void;
}

const formSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date({
    required_error: "End date is required",
  }),
  latitude: z.string().transform(val => val ? Number(val) : null),
  longitude: z.string().transform(val => val ? Number(val) : null),
  contract_value: z.string().transform(val => val ? Number(val) : null),
  activity_description: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export function CreateActivityForm({ onSuccess }: CreateActivityFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      city: "",
      location: "",
      latitude: "",
      longitude: "",
      contract_value: "",
      activity_description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const formattedData = {
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
      };

      const { error } = await supabase.from("activities").insert(formattedData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating activity:", error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ActivityBasicFields form={form} brands={Object.values(BrandName)} />
        <ActivityDateFields form={form} />
        <ActivityOptionalFields form={form} />
        <Button type="submit" className="w-full">Create Activity</Button>
      </form>
    </Form>
  );
}