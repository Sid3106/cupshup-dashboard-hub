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

interface CreateActivityFormProps {
  onSuccess: () => void;
}

export interface FormData {
  brand: BrandName;
  city: string;
  location: string;
  start_date: Date;
  end_date: Date;
  latitude?: number;
  longitude?: number;
  contract_value?: number;
  activity_description?: string;
}

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
  const form = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from('activities')
        .insert([{
          ...data,
          start_date: data.start_date.toISOString(),
          end_date: data.end_date.toISOString(),
          created_by: user?.id,
        }]);

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