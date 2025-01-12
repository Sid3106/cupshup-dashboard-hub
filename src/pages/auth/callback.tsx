import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          console.error('AuthCallback: No access token found in URL');
          toast.error("Invalid authentication link. Please request a new one.");
          navigate('/auth');
          return;
        }

        // Set the session using the access token
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });

        if (sessionError) {
          console.error('AuthCallback: Session error:', sessionError);
          toast.error("Authentication failed. Please try signing in again.");
          navigate('/auth');
          return;
        }

        if (!session?.user) {
          console.error('AuthCallback: No user in session');
          toast.error("Unable to verify user. Please try again.");
          navigate('/auth');
          return;
        }

        console.log('AuthCallback: Session established, checking profile');
        
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          console.error('AuthCallback: Profile error:', profileError);
          toast.error("Error accessing user profile. Please try again.");
          navigate('/auth');
          return;
        }

        if (!profile) {
          console.error('AuthCallback: No profile found');
          toast.error("User profile not found. Please contact support.");
          navigate('/auth');
          return;
        }

        console.log('AuthCallback: Authentication successful, redirecting to dashboard');
        toast.success("Successfully signed in!");
        navigate('/dashboard');

      } catch (error) {
        console.error('AuthCallback: Unexpected error:', error);
        toast.error("An unexpected error occurred. Please try again.");
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#00A979]">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A979] mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your authentication...</p>
      </div>
    </div>
  );
}