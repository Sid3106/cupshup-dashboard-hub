import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('Checking auth status on Index page...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found, redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          console.log('No session found, redirecting to auth...');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        toast.error("An error occurred. Please try again.");
        navigate('/auth');
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
    </div>
  );
};

export default Index;