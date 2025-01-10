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

const COOLDOWN_PERIOD = 20000; // 20 seconds in milliseconds
let lastInviteTime = 0;

export const useInviteForm = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if enough time has passed since the last invite
    const now = Date.now();
    const timeSinceLastInvite = now - lastInviteTime;
    
    if (timeSinceLastInvite < COOLDOWN_PERIOD) {
      const remainingSeconds = Math.ceil((COOLDOWN_PERIOD - timeSinceLastInvite) / 1000);
      toast.error(`Please wait ${remainingSeconds} seconds before sending another invitation`);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending invitation to:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
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

      if (error) {
        // Check specifically for rate limit errors
        if (error.message?.includes('rate_limit')) {
          toast.error("Please wait a few seconds before trying again");
          return;
        }
        console.error('Supabase OTP Error:', error);
        throw error;
      }

      console.log('OTP Response:', data);
      lastInviteTime = Date.now(); // Update the last invite time
      toast.success("Invitation sent successfully. The user will receive a magic link via email.");
      onSuccess();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Invitation Error:', error);
      // Handle rate limit errors that might come through the catch block
      if (error.message?.includes('rate_limit')) {
        toast.error("Please wait a few seconds before trying again");
      } else {
        toast.error(error.message || "Failed to send invitation");
      }
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