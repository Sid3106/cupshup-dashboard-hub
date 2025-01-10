import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface InviteFormData {
  email: string;
  role: string;
}

const initialFormData: InviteFormData = {
  email: '',
  role: '',
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
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message?.includes('rate_limit')) {
          toast.error("Please wait a few seconds before trying again");
          return;
        }
        throw error;
      }

      console.log('OTP Response:', data);
      lastInviteTime = Date.now();
      toast.success("Invitation sent successfully. The user will receive a magic link via email.");
      onSuccess();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Invitation Error:', error);
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