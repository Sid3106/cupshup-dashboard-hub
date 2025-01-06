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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleAuthStateChange = async ({ event, session }: any) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN") {
        setIsLoading(true);
        try {
          // If we have profile data from URL, create profile
          if (profileData) {
            console.log("Creating profile with data:", profileData);
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                user_id: session.user.id,
                ...profileData
              }]);

            if (profileError) {
              console.error('Profile creation error:', profileError);
              toast({
                title: "Error",
                description: "Failed to create user profile. Please try again.",
                variant: "destructive",
              });
              return;
            }

            console.log("Profile created successfully");
          }

          // Redirect to dashboard after successful sign in
          navigate('/dashboard');
        } catch (error: any) {
          console.error('Error during sign in:', error);
          toast({
            title: "Error",
            description: error.message || "An error occurred during sign in. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Try to parse profile data from URL parameters
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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

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
              redirectTo={`${window.location.origin}/auth/callback`}
              onlyThirdPartyProviders={false}
              magicLink={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}