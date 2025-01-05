import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Check if there's profile data in the URL
    const url = new URL(window.location.href);
    const profileParam = url.searchParams.get('profile');
    
    if (profileParam) {
      try {
        const decodedProfile = JSON.parse(decodeURIComponent(profileParam));
        setProfileData(decodedProfile);
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        try {
          // If we have profile data from the URL, create the profile
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

            // If the role is Client, we need to create a client entry
            if (profileData.role === 'Client') {
              const { error: clientError } = await supabase
                .from('clients')
                .insert({
                  user_id: session.user.id,
                  client_name: profileData.name,
                  client_email: session.user.email,
                  client_phone: profileData.phone_number,
                  city: profileData.city,
                  brand_name: profileData.brand_name
                });

              if (clientError) {
                console.error('Client creation error:', clientError);
                throw clientError;
              }
            }
          }

          navigate('/dashboard');
        } catch (error) {
          console.error('Error creating profile:', error);
          toast({
            title: "Error",
            description: "There was a problem setting up your profile. Please contact support.",
            variant: "destructive",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, profileData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to CupShup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>

        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#00A979',
                    brandAccent: '#008F66',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}