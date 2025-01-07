import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleError = (error: AuthError | PostgrestError) => {
    console.error('Error:', error);
    let errorMessage = 'An error occurred during authentication.';
    
    if ('code' in error) {
      switch (error.code) {
        case 'invalid_credentials':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'invalid_grant':
          errorMessage = 'Invalid login credentials. Please try again.';
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
      console.log("Auth state changed - Event:", event);
      console.log("Auth state changed - Session:", session);
      
      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            handleError(profileError);
            return;
          }

          console.log("User profile:", profile);

          if (profileData && !profile) {
            console.log("Creating profile with data:", profileData);
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert([{
                user_id: session.user.id,
                ...profileData
              }]);

            if (createProfileError) {
              console.error('Profile creation error:', createProfileError);
              handleError(createProfileError);
              return;
            }

            console.log("Profile created successfully");
          }

          navigate('/dashboard');
        } catch (error: any) {
          console.error('Error during sign in:', error);
          handleError(error);
        } finally {
          setIsLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setAuthError(null);
      }
    };

    try {
      const encodedData = searchParams.get('profile');
      if (encodedData) {
        const decodedData = JSON.parse(atob(encodedData));
        console.log("Decoded profile data:", decodedData);
        setProfileData(decodedData);
      }
    } catch (error) {
      console.error('Error parsing profile data:', error);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthStateChange("SIGNED_IN", session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, profileData, searchParams, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const redirectURL = `${window.location.origin}/auth/callback`;
  console.log("Redirect URL:", redirectURL);

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Welcome to our platform. Please sign in to continue.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
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
                      brand: '#404040',
                      brandAccent: '#2d2d2d'
                    }
                  }
                }
              }}
              providers={[]}
              redirectTo={redirectURL}
              onlyThirdPartyProviders={false}
              magicLink={true}
              view="sign_in"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}