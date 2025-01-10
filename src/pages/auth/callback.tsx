import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) throw new Error("No user session found");

        const { user } = session;
        const metadata = user.user_metadata;

        // Create profile record with all required fields
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            role: metadata.role,
            email_id: user.email,
            phone_number: "Not provided", // Required field with default value
            name: user.email.split('@')[0], // Default name from email
            city: null // Optional field
          });

        if (profileError) throw profileError;

        // If role is Vendor, create vendor record with all required fields
        if (metadata.role === 'Vendor') {
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert({
              vendor_email: user.email,
              vendor_name: user.email.split('@')[0], // Default name from email
              vendor_phone: "Not provided", // Required field with default value
              user_id: user.id,
              city: null // Optional field
            });

          if (vendorError) throw vendorError;
        }

        toast.success("Account setup completed successfully");
        navigate("/dashboard");
      } catch (error) {
        console.error("Error in auth callback:", error);
        setError(error.message);
        toast.error("Failed to complete account setup");
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
    </div>
  );
}