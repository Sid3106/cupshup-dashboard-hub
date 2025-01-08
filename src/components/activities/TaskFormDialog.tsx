import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TaskFormValues {
  customer_name: string;
  customer_number: string;
  sales_order: number;
  products_sold: string;
}

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
}

export function TaskFormDialog({ isOpen, onClose, activityId }: TaskFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<TaskFormValues>({
    defaultValues: {
      customer_name: "",
      customer_number: "",
      sales_order: undefined,
      products_sold: "",
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    try {
      setIsLoading(true);

      // Get the activity details to populate task mapping
      const { data: activity } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      // Get vendor details
      const { data: { user } } = await supabase.auth.getUser();
      const { data: vendor } = await supabase
        .from('vendors')
        .select('vendor_name, vendor_email')
        .eq('user_id', user?.id)
        .single();

      if (!activity || !vendor) {
        throw new Error('Required data not found');
      }

      // Create task mapping entry
      const { error: taskError } = await supabase
        .from('task_mapping')
        .insert({
          activity_id: activityId,
          brand: activity.brand,
          city: activity.city,
          location: activity.location,
          start_date: activity.start_date,
          end_date: activity.end_date,
          vendor_name: vendor.vendor_name,
          vendor_email: vendor.vendor_email,
          customer_name: values.customer_name,
          customer_number: values.customer_number,
          sales_order: values.sales_order,
          products_sold: values.products_sold,
        });

      if (taskError) throw taskError;

      toast({
        title: "Success",
        description: "Task details have been saved successfully",
      });

      onClose();
      form.reset();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error",
        description: "Failed to save task details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              rules={{ required: "Customer name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter customer name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_number"
              rules={{ 
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter phone number" type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sales_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Order</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="Enter sales order number"
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="products_sold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products Sold</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter products sold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}