import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../CreateActivityForm";

interface ActivityDateFieldsProps {
  form: UseFormReturn<FormData>;
}

export function ActivityDateFields({ form }: ActivityDateFieldsProps) {
  const handleDateSelect = (date: Date | undefined, field: any) => {
    if (date) {
      const currentValue = field.value || new Date();
      const newDate = new Date(date);
      // Preserve existing time or set to current time if no existing value
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
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="start_date"
        render={({ field }) => (
          <FormItem>
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
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Pick a date and time</span>
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
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="end_date"
        render={({ field }) => (
          <FormItem>
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
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Pick a date and time</span>
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
          </FormItem>
        )}
      />
    </div>
  );
}