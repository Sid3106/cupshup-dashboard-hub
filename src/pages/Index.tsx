import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    let mounted = true;

    const checkAuthAndRedirect = async () => {
      try {
        console.log('Starting auth check on Index page...');
        setIsLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!mounted) return;
        
        if (session) {
          console.log('Session found, checking profile...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            throw profileError;
          }

          if (profile) {
            console.log('Profile found, redirecting to dashboard...');
            navigate('/dashboard');
          } else {
            console.log('No profile found, redirecting to auth...');
            toast.error("User profile not found. Please sign in again.");
            await supabase.auth.signOut();
            navigate('/auth');
          }
        } else {
          console.log('No session found, redirecting to auth...');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error("An error occurred. Please try again.");
        navigate('/auth');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthAndRedirect();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  return null;
};

export default Index;