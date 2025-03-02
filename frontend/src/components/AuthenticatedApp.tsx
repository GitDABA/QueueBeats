import React, { useEffect, useState } from 'react';
import { AuthProvider } from './AuthProvider';
import { loadSupabaseConfig } from '../utils/supabase';

type Props = {
  children: React.ReactNode;
};

export function AuthenticatedApp({ children }: Props) {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load Supabase configuration from our API
        const success = await loadSupabaseConfig();
        if (!success) {
          throw new Error('Failed to load Supabase configuration');
        }
        setConfigLoaded(true);
      } catch (err: any) {
        console.error('Error initializing app:', err);
        setError(err.message || 'Failed to initialize the application');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-red-500/30 shadow-xl max-w-md w-full text-center">
          <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Application Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!configLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  return <AuthProvider>{children}</AuthProvider>;
}
