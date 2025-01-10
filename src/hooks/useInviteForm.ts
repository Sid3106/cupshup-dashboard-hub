import { useState } from "react";
import { toast } from "sonner";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Sending invitation to:', formData.email);
      
      // Wrap the OTP call in a single try-catch to prevent multiple response reads
      let signInResponse;
      try {
        signInResponse = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            data: {
              name: formData.name,
              phone_number: formData.phone_number,
              role: formData.role,
              city: formData.city,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } catch (signInError) {
        console.error('SignIn Error:', signInError);
        throw new Error(signInError.message || 'Failed to send invitation');
      }

      if (signInResponse.error) {
        console.error('SignIn Response Error:', signInResponse.error);
        throw signInResponse.error;
      }

      toast.success("Invitation sent successfully. The user will receive a magic link via email.");
      onSuccess();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || "Failed to send invitation");
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