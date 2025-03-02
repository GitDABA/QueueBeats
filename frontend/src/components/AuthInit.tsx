import React, { useCallback, useEffect, useState } from 'react';
import { loadSupabaseConfig } from '../utils/supabase';

type AuthInitProps = {
  children: React.ReactNode;
};

export const AuthInit: React.FC<AuthInitProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const initializeSupabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load Supabase configuration
      const success = await loadSupabaseConfig();
      if (!success) {
        throw new Error('Failed to load Supabase configuration');
      }
    } catch (error: any) {
      console.error('Error initializing Supabase:', error);
      setError(error.message || 'Failed to initialize authentication');
      
      // If we haven't exceeded max attempts, retry after a delay
      if (initAttempts < MAX_ATTEMPTS) {
        setTimeout(() => {
          setInitAttempts(prev => prev + 1);
        }, 1500); // Retry after 1.5 seconds
      }
    } finally {
      setIsLoading(false);
    }
  }, [initAttempts]);

  useEffect(() => {
    initializeSupabase();
  }, [initAttempts, initializeSupabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {initAttempts > 0 ? `Initializing app (attempt ${initAttempts}/${MAX_ATTEMPTS})...` : 'Initializing app...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && initAttempts >= MAX_ATTEMPTS) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-md w-full bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 shadow-xl text-center">
          <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            We tried to connect {MAX_ATTEMPTS} times but couldn't reach the authentication service.
          </p>
          <button
            onClick={() => {
              setInitAttempts(0); // Reset attempts counter and try again
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
