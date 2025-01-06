import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../CreateActivityForm";
import { useEffect } from "react";

interface ActivityDateFieldsProps {
  form: UseFormReturn<FormValues>;
}

export function ActivityDateFields({ form }: ActivityDateFieldsProps) {
  // Initialize default dates if not set
  useEffect(() => {
    if (!form.getValues("start_date")) {
      form.setValue("start_date", new Date());
    }
    if (!form.getValues("end_date")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      form.setValue("end_date", tomorrow);
    }
  }, [form]);

  const handleDateSelect = (date: Date | undefined, field: any) => {
    if (date) {
      const currentValue = field.value || new Date();
      const newDate = new Date(date);
      newDate.setHours(currentValue.getHours() || new Date().getHours());
      newDate.setMinutes(currentValue.getMinutes() || new Date().getMinutes());
      field.onChange(newDate);
    }
  };

  const handleTimeChange = (timeStr: string, field: any) => {
    if (!timeStr) return;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = field.value || new Date();
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    field.onChange(newDate);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="start_date"
        rules={{ required: "Start date is required" }}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => handleDateSelect(date, field)}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    onChange={(e) => handleTimeChange(e.target.value, field)}
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
            <div className="text-sm text-muted-foreground mt-1">
              {field.value && format(field.value, "h:mm a")}
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="end_date"
        rules={{ required: "End date is required" }}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>End Date <span className="text-red-500">*</span></FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => handleDateSelect(date, field)}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    onChange={(e) => handleTimeChange(e.target.value, field)}
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
            <div className="text-sm text-muted-foreground mt-1">
              {field.value && format(field.value, "h:mm a")}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}