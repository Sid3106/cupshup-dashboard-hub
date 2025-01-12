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
    let mounted = true;
    console.log('ProtectedRoute: Initializing auth check');
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('ProtectedRoute: Session check result:', !!session);

        if (!session) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        console.log('ProtectedRoute: Profile check result:', !!profile, profileError);

        if (mounted) {
          setIsAuthenticated(!profileError && !!profile);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('ProtectedRoute: Auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast.error("Authentication error. Please try again.");
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('ProtectedRoute: Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/auth', { replace: true });
        }
      } else if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (mounted) {
          setIsAuthenticated(!!profile);
          setIsLoading(false);
        }
      }
    });

    return () => {
      console.log('ProtectedRoute: Cleaning up');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    console.log('ProtectedRoute: Showing loading spinner');
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
    </div>;
  }

  console.log('ProtectedRoute: Rendering final state:', { isAuthenticated });
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}