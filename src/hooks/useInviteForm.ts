import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteFormData {
  name: string;
  email: string;
  phone_number: string;
  role: string;
  city: string;
}

const initialFormData: InviteFormData = {
  name: '',
  email: '',
  phone_number: '',
  role: '',
  city: '',
};

export const useInviteForm = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>(initialFormData);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      onSuccess();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof InviteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    isLoading,
    handleSubmit,
    updateField
  };
};