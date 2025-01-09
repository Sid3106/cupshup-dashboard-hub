import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSidebar } from "@/components/auth/AuthSidebar";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [view, setView] = useState<'sign_in' | 'update_password'>('sign_in');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthError(null);
        
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

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-[#00A979]">
      <AuthSidebar view={view} />
      <div className="p-4 lg:p-8 h-full flex items-center justify-center">
        <Card className="mx-auto w-full max-w-md">
          <div className="flex flex-col items-center pt-8">
            <img 
              src="https://zdslyhsaebzabstxskgd.supabase.co/storage/v1/object/sign/cupshup_images/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwX2ltYWdlcy9DdXBTaHVwTG9nby5wbmciLCJpYXQiOjE3MzYzODU2NjIsImV4cCI6MTc2NzkyMTY2Mn0.Ui1vKAwvRcJ-qPbPC7U74ywOwiRUMZo4j8-eARVr6rs&t=2025-01-09T01%3A21%3A02.723Z" 
              alt="CupShup Logo" 
              className="h-16 w-auto mb-4"
            />
            <p className="font-roboto text-[#00A979] text-lg mb-6">Let's Brew Innovation!</p>
          </div>
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