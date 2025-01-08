import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSidebar } from "@/components/auth/AuthSidebar";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [view, setView] = useState<'sign_in' | 'update_password'>('sign_in');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Clear any stale sessions
        await supabase.auth.signOut();
        
        // Reset error state
        setAuthError(null);
        
        // Check URL parameters for error messages
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
        
        if (error === 'access_denied' && errorDescription) {
          setAuthError(decodeURIComponent(errorDescription));
          setView('update_password');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError('Failed to initialize authentication');
      }
    };

    initializeAuth();
  }, [searchParams]);

  const handleError = (error: AuthError) => {
    console.error('Auth Error:', error);
    let errorMessage = 'An error occurred during authentication.';
    
    if ('code' in error) {
      switch (error.code) {
        case 'invalid_credentials':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'session_not_found':
          errorMessage = 'Your session has expired. Please sign in again.';
          break;
        case 'user_not_found':
          errorMessage = 'No account found with these credentials.';
          break;
        case 'email_not_confirmed':
          errorMessage = 'Please verify your email address before signing in.';
          break;
        default:
          errorMessage = error.message;
      }
    }
    
    setAuthError(errorMessage);
    toast({
      title: "Authentication Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        try {
          // Verify session is valid
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!user) throw new Error('No user found');

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profileError) throw profileError;

          if (profile) {
            navigate('/dashboard');
          } else {
            // Handle missing profile
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert([{
                user_id: user.id,
                ...profileData
              }]);

            if (createProfileError) throw createProfileError;
            navigate('/dashboard');
          }
        } catch (error: any) {
          console.error('Error during sign in:', error);
          handleError(error);
          // Sign out on error to prevent invalid session state
          await supabase.auth.signOut();
        } finally {
          setIsLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        setAuthError(null);
      } else if (event === "PASSWORD_RECOVERY") {
        setView('update_password');
      }
    };

    // Initialize auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, profileData, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979]"></div>
      </div>
    );
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <AuthSidebar view={view} />
      <div className="p-4 lg:p-8 h-full flex items-center">
        <Card className="mx-auto w-full max-w-md">
          <AuthHeader view={view} />
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#00A979',
                      brandAccent: '#008c64'
                    }
                  }
                }
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/auth/callback`}
              onlyThirdPartyProviders={false}
              magicLink={false}
              view={view}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}