import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking auth status...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          console.log('No session found');
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            toast.error("Please sign in to access this page");
          }
          return;
        }

        console.log('Session found, checking profile...');
        if (mounted) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) throw profileError;

          console.log('Profile status:', !!profile);
          setIsAuthenticated(!!profile);
          setIsLoading(false);
          
          if (!profile) {
            toast.error("User profile not found. Please contact support.");
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast.error("Authentication error occurred. Please try signing in again.");
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || abortController.signal.aborted) return;

      console.log('Auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/auth', { replace: true });
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) throw profileError;

          if (mounted) {
            setIsAuthenticated(!!profile);
            setIsLoading(false);
          }
          
          if (!profile) {
            toast.error("User profile not found. Please contact support.");
          }
        } catch (error) {
          console.error('Profile fetch error:', error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            toast.error("Error fetching user profile");
          }
        }
      }
    });

    return () => {
      mounted = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}