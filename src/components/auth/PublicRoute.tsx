import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking public route auth status...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) throw profileError;

          console.log('Public route profile status:', !!profile);
          setIsAuthenticated(!!profile);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Public route auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || abortController.signal.aborted) return;

      console.log('Public route auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
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
        } catch (error) {
          console.error('Public route profile fetch error:', error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        }
      }
    });

    return () => {
      mounted = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}