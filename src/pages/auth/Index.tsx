import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const handleAuthStateChange = async ({ event, session }: any) => {
      if (event === "SIGNED_IN") {
        try {
          // If we have profile data from the invite URL, create the profile
          if (profileData) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: session.user.id,
                ...profileData
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
              throw profileError;
            }
          }

          navigate('/dashboard');
        } catch (error: any) {
          console.error('Error during profile creation:', error);
          
          // Check if it's a user_already_exists error
          if (error.message?.includes('user_already_exists')) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message || "Failed to create user profile. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else if (event === "SIGNED_OUT") {
        navigate('/auth');
      }
    };

    // Try to parse profile data from URL parameters
    try {
      const encodedData = searchParams.get('profile');
      if (encodedData) {
        const decodedData = JSON.parse(atob(encodedData));
        setProfileData(decodedData);
      }
    } catch (error) {
      console.error('Error parsing profile data:', error);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, profileData, searchParams, toast]);

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
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              redirectTo={window.location.origin + '/auth'}
              view="sign_in"
              showLinks={true}
              {...{
                localization: {
                  variables: {
                    sign_up: {
                      email_label: "Email",
                      password_label: "Password",
                      email_input_placeholder: "Your email address",
                      password_input_placeholder: "Your password",
                      button_label: "Sign up",
                      loading_button_label: "Signing up ...",
                      social_provider_text: "Sign in with {{provider}}",
                      link_text: "Don't have an account? Sign up",
                      confirmation_text: "Check your email for the confirmation link"
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}