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
    let mounted = true;
    console.log('PublicRoute: Initializing auth check');

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('PublicRoute: Session check result:', !!session);

        if (!session) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          console.log('PublicRoute: Profile check result:', !!profile);
          setIsAuthenticated(!!profile);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('PublicRoute: Auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('PublicRoute: Auth state changed:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        setIsAuthenticated(!!profile);
        setIsLoading(false);
      }
    });

    return () => {
      console.log('PublicRoute: Cleaning up');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    console.log('PublicRoute: Showing loading spinner');
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
    </div>;
  }

  console.log('PublicRoute: Rendering final state:', { isAuthenticated });
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}