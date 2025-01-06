import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../CreateActivityForm";

interface ActivityOptionalFieldsProps {
  form: UseFormReturn<FormData>;
}

export function ActivityOptionalFields({ form }: ActivityOptionalFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input type="number" step="any" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input type="number" step="any" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="contract_value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contract Value</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="activity_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Activity Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}