import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, getCurrentUser, loadSupabaseConfig } from '../utils/supabase';
import { AuthContext, createProfile, fetchProfile, updateProfile, ensureUserProfileWithTimeout } from '../utils/auth';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../utils/auth';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initRef = useRef(false);

  // Ensure Supabase is initialized before doing anything auth-related
  useEffect(() => {
    const initSupabase = async () => {
      if (initialized) return;
      
      try {
        const success = await loadSupabaseConfig();
        setInitialized(success);
        if (!success) {
          console.warn('Failed to initialize Supabase, auth features will be limited');
        }
      } catch (error) {
        console.error('Error initializing Supabase:', error);
      }
    };
    
    initSupabase();
  }, [initialized]);

  // Extract profile creation logic to a separate function to avoid closures in effect
  const ensureUserProfile = useCallback(async (userId: string) => {
    try {
      console.log(`Ensuring user profile using improved timeout handling for ${userId}`);
      
      // Use the improved ensureUserProfileWithTimeout function 
      // that has retry logic and better error handling
      const profile = await ensureUserProfileWithTimeout(userId);
      
      if (profile) {
        console.log('Successfully ensured user profile exists:', profile.id);
        return profile;
      } else {
        console.warn('Could not ensure user profile exists after multiple attempts');
        return null;
      }
    } catch (error) {
      console.error('Error with user profile:', error);
      return null;
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    // Only proceed if Supabase is initialized
    if (!initialized) return;
    
    // Prevent multiple initializations
    if (initRef.current) return;
    initRef.current = true;
    
    let isMounted = true;
    console.log('AuthProvider: Initializing auth');

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // First, check for an active user
        const currentUser = await getCurrentUser();
        
        if (isMounted) {
          setUser(currentUser);
          
          // Setup auth state listener
          if (subscriptionRef.current) {
            console.log('Cleaning up existing auth subscription');
            subscriptionRef.current.unsubscribe();
          }
          
          try {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
              async (event, session) => {
                console.log(`Supabase auth event: ${event}`);
                
                if (isMounted) {
                  setUser(session?.user ?? null);

                  // If a user just signed up, create their profile
                  if (event === 'SIGNED_IN' && session?.user) {
                    await ensureUserProfile(session.user.id);
                  }
                }
              }
            );
            
            subscriptionRef.current = subscription;
          } catch (error) {
            console.error('Error setting up auth state listener:', error);
          }
          
          // Ensure a new user has a profile
          if (currentUser) {
            await ensureUserProfile(currentUser.id);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set a timeout to ensure loading state doesn't get stuck
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('Auth initialization timed out, forcing loading state to false');
        setLoading(false);
      }
    }, 15000);

    initializeAuth()
      .then(() => clearTimeout(timeout))
      .catch((error) => {
        console.error('Auth initialization error:', error);
        clearTimeout(timeout);
      });

    // Cleanup on unmount
    return () => {
      console.log('AuthProvider: Cleaning up');
      isMounted = false;
      clearTimeout(timeout);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [ensureUserProfile, initialized]);

  // Method to sign in the user
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!initialized) {
        console.error('Cannot sign in: Supabase is not initialized');
        return { error: new Error('Authentication service is not initialized') };
      }
      
      console.log('Attempting to sign in with:', { email, initialized });
      
      // Add timeout to prevent hanging
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign in timed out after 15 seconds')), 15000);
      });
      
      // Race the sign in promise against the timeout
      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise.then(() => {
          throw new Error('Authentication timed out');
        }),
      ]) as any;
      
      console.log('Sign in response:', { success: !error, userId: data?.user?.id });
      
      if (error) {
        console.error('Error signing in:', error);
        return { error };
      }
      
      // Add additional profile creation debugging
      if (data.user) {
        try {
          console.log('Ensuring user profile exists after successful sign-in...');
          
          // Use ensureUserProfileWithTimeout function to handle profile creation/fetching
          ensureUserProfileWithTimeout(data.user.id)
            .then(profile => {
              console.log('Profile status after sign-in:', { exists: !!profile });
            })
            .catch(profileError => {
              console.error('Profile processing error during sign-in:', profileError);
              // Continue login flow despite profile error
            });
          
          // Note: We're not awaiting this to keep sign-in fast, but still ensuring profile creation
        } catch (profileError) {
          console.error('Profile processing error:', profileError);
          // Continue login flow despite profile error
        }
      }
      
      // Set the user immediately
      setUser(data.user);
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error };
    }
  }, [initialized]);

  // Method to sign up a new user
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      if (!initialized) {
        console.error('Cannot sign up: Supabase is not initialized');
        return { error: new Error('Authentication service is not initialized'), data: null };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Error signing up:', error);
        return { error, data: null };
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { error, data: null };
    }
  }, [initialized]);

  // Method to sign out the user
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }, []);

  // Method to update the user's profile
  const updateUserProfile = useCallback(async (profile: Partial<Profile>) => {
    if (!user) {
      console.error('Cannot update profile: No user is logged in');
      return;
    }
    
    try {
      await updateProfile(user.id, profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [user]);

  // Create the auth context value
  const authValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile: updateUserProfile,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}
