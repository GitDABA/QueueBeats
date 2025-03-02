import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any } | undefined>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any } | undefined>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
};

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, website')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, profile: Partial<Profile>) => {
  try {
    // Filter out any undefined values
    const updates = Object.entries(profile).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
    
    // Only proceed if there are actual updates
    if (Object.keys(updates).length === 0) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const createProfile = async (userId: string, profile: Partial<Profile> = {}) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};
