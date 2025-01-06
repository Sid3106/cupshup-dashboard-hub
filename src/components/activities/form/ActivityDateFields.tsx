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
                  onSelect={(date) => {
                    if (date) {
                      const currentValue = field.value || new Date();
                      date.setHours(currentValue.getHours());
                      date.setMinutes(currentValue.getMinutes());
                      field.onChange(date);
                    }
                  }}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const date = field.value || new Date();
                      date.setHours(hours);
                      date.setMinutes(minutes);
                      field.onChange(new Date(date));
                    }}
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
                  onSelect={(date) => {
                    if (date) {
                      const currentValue = field.value || new Date();
                      date.setHours(currentValue.getHours());
                      date.setMinutes(currentValue.getMinutes());
                      field.onChange(date);
                    }
                  }}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const date = field.value || new Date();
                      date.setHours(hours);
                      date.setMinutes(minutes);
                      field.onChange(new Date(date));
                    }}
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