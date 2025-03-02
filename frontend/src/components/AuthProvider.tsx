import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, getCurrentUser } from '../utils/supabase';
import { AuthContext, createProfile, fetchProfile, updateProfile } from '../utils/auth';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../utils/auth';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initRef = useRef(false);

  // Extract profile creation logic to a separate function to avoid closures in effect
  const ensureUserProfile = useCallback(async (userId: string) => {
    try {
      // Check if profile exists first
      const profile = await fetchProfile(userId).catch(() => null);
      
      if (!profile) {
        // Create profile if it doesn't exist
        await createProfile(userId, {
          id: userId,
          username: null,
          full_name: null,
          avatar_url: null,
          website: null,
        });
      }
    } catch (error) {
      console.error('Error with user profile:', error);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
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

    initializeAuth();

    // Cleanup on unmount
    return () => {
      console.log('AuthProvider: Cleaning up');
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [ensureUserProfile]);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUserProfile = async (profile: Partial<Profile>) => {
    try {
      if (user) {
        await updateProfile(user.id, profile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile: updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
