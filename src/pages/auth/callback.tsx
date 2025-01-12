import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('AuthCallback: Starting authentication check');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallback: Session error:', error);
          toast.error("Authentication failed. Please try signing in again.");
          navigate('/auth');
          return;
        }
        
        if (session) {
          console.log('AuthCallback: Session found, checking profile');
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

          if (profile) {
            console.log('AuthCallback: Profile found, redirecting to dashboard');
            toast.success("Successfully signed in!");
            navigate('/dashboard');
          } else {
            console.log('AuthCallback: No profile found');
            toast.error("User profile not found. Please contact support.");
            navigate('/auth');
          }
        } else {
          console.log('AuthCallback: No session found');
          toast.error("No active session found. Please try signing in again.");
          navigate('/auth');
        }
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