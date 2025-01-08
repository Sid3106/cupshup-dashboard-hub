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
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [view, setView] = useState<'sign_in' | 'update_password'>('sign_in');

  useEffect(() => {
    const checkExistingSession = async () => {
      console.log("Checking existing session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Session check result:", { session, error });
      
      if (session) {
        console.log("Valid session found, navigating to dashboard");
        navigate('/dashboard');
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        setAuthError(null);
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
        
        console.log("URL parameters:", { error, errorDescription });
        
        if (error === 'access_denied' && errorDescription) {
          console.log("Access denied error detected");
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

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        try {
          console.log("Verifying user session...");
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          console.log("User verification result:", { user, userError });
          
          if (userError) throw userError;
          if (!user) throw new Error('No user found');

          console.log("Checking user profile...");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          console.log("Profile check result:", { profile, profileError });

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (!profile) {
            console.log("Creating new profile...");
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert([{
                user_id: user.id,
                role: 'Client',
                phone_number: '',
                name: user.email?.split('@')[0] || 'User'
              }]);

            console.log("Profile creation result:", { createProfileError });
            if (createProfileError) throw createProfileError;
          }
          
          console.log("Authentication successful, navigating to dashboard");
          navigate('/dashboard');
        } catch (error: any) {
          console.error('Error during sign in:', error);
          const errorMessage = error.message || 'An error occurred during sign in';
          setAuthError(errorMessage);
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          });
          await supabase.auth.signOut();
        } finally {
          setIsLoading(false);
        }
      }
    };

    console.log("Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      console.log("Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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