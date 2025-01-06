import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "@/types/activities";
import { useToast } from "@/hooks/use-toast";

interface AssignActivityDialogProps {
  activity: Activity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  vendorId: string;
  message: string;
}

export function AssignActivityDialog({ activity, open, onOpenChange }: AssignActivityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      vendorId: "",
      message: "",
    },
  });

  const { data: vendors, isLoading: isLoadingVendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("vendor_name");
      
      if (error) throw error;
      return data;
    },
  });

  const sendVendorEmail = async (vendorName: string, vendorEmail: string, message: string) => {
    const { error } = await supabase.functions.invoke('send-vendor-email', {
      body: {
        vendor_name: vendorName,
        vendor_email: vendorEmail,
        brand: activity.brand,
        location: activity.location,
        start_date: activity.start_date,
        end_date: activity.end_date,
        message: message,
      },
    });

    if (error) {
      console.error('Error sending vendor email:', error);
      throw error;
    }
  };

  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Get vendor details
      const selectedVendor = vendors?.find(v => v.id === formData.vendorId);
      if (!selectedVendor) {
        throw new Error("Selected vendor not found");
      }

      // Get current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // Create assignment record
      const { error: insertError } = await supabase
        .from("activity_mapped")
        .insert({
          activity_id: activity.id,
          vendor_id: selectedVendor.id,
          vendor_name: selectedVendor.vendor_name,
          vendor_email: selectedVendor.vendor_email,
          vendor_phone: selectedVendor.vendor_phone,
          message: formData.message,
          assigned_by: session.user.id,
        });

      if (insertError) throw insertError;

      // Send email to vendor
      await sendVendorEmail(
        selectedVendor.vendor_name,
        selectedVendor.vendor_email,
        formData.message
      );

      toast({
        title: "Success",
        description: "Activity assigned and notification sent to vendor",
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error assigning activity:", error);
      toast({
        title: "Error",
        description: "Failed to assign activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Activity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Vendor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoadingVendors}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors?.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Vendor</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter message for the vendor"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingVendors}>
                {isSubmitting ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}