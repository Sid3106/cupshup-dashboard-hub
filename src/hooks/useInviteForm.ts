import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteFormData {
  name: string;
  email: string;
  phone_number: string;
  role: string;
  city: string;
  brand_name?: string;
}

const initialFormData: InviteFormData = {
  name: '',
  email: '',
  phone_number: '',
  role: '',
  city: '',
  brand_name: '',
};

export const useInviteForm = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>(initialFormData);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate brand name for client role
      if (formData.role === 'Client' && !formData.brand_name) {
        throw new Error('Brand name is required for client role');
      }

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
      
      const errorMessage = error.message || "Failed to send invitation";
      const description = errorMessage.includes("already associated with an account") 
        ? "This email is already associated with an account. The user already has access to the platform."
        : errorMessage;

      toast({
        title: "Error",
        description,
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