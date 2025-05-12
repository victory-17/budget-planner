import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback triggered');
        
        // Get the auth code from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const code = hashParams.get('code');
        
        if (!code) {
          const queryParams = new URLSearchParams(window.location.search);
          const queryCode = queryParams.get('code');
          
          if (!queryCode) {
            console.log('No code found in URL');
            setError('No authentication code found in URL');
            return;
          }
          
          console.log('Code found in query params:', queryCode);
        } else {
          console.log('Code found in hash params:', code);
        }
        
        // Exchange the code for a session
        console.log('Exchanging code for session...');
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (error) {
          console.error('Error exchanging code:', error);
          setError(error.message);
          return;
        }
        
        console.log('Auth successful, redirecting to dashboard');
        // Redirect to dashboard after successful authentication
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'An error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-budget-green text-white rounded-md hover:bg-budget-green/90"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-budget-green mb-4" />
          <p className="text-lg">Completing authentication...</p>
        </div>
      )}
    </div>
  );
} 