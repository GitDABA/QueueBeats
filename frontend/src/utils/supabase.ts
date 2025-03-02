import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// IMPORTANT: Using singleton pattern to prevent multiple GoTrueClient instances
// We'll keep track of if we've initialized the client
let isInitialized = false;

// We'll fetch these values from our backend API or localStorage
let supabaseUrl = '';
let supabaseAnonKey = '';

// Function to initialize Supabase with explicit credentials
export const initializeSupabase = async (url: string, key: string) => {
  try {
    if (!url || !key) {
      return false;
    }
    
    // If already initialized with these values, don't reinitialize
    if (isInitialized && supabaseUrl === url && supabaseAnonKey === key) {
      console.log('Supabase already initialized with these credentials');
      return true;
    }
    
    supabaseUrl = url;
    supabaseAnonKey = key;
    
    // Only reinitialize if not already initialized or if credentials changed
    if (!isInitialized) {
      reinitializeClient();
    }
    
    // Test the connection
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase initialization test failed:', error);
      return false;
    }
    
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return false;
  }
};

// Function to load Supabase config
export const loadSupabaseConfig = async () => {
  try {
    // If already initialized, don't reinitialize
    if (isInitialized && supabase) {
      console.log('Supabase already initialized');
      return true;
    }
    
    // Force a refresh of the connection if it's been more than an hour
    const lastInitTime = localStorage.getItem('queuebeats_supabase_last_init');
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    if (lastInitTime && now - parseInt(lastInitTime) < ONE_HOUR) {
      console.log('Supabase connection is fresh (less than an hour old)');
    } else {
      console.log('Supabase connection refresh needed');
      localStorage.setItem('queuebeats_supabase_last_init', now.toString());
    }
    
    // First, check if we have saved credentials in localStorage
    const savedUrl = localStorage.getItem('queuebeats_supabase_url');
    const savedKey = localStorage.getItem('queuebeats_supabase_anon_key');
    
    if (savedUrl && savedKey) {
      console.log('Using saved Supabase credentials from localStorage');
      return await initializeSupabase(savedUrl, savedKey);
    }
    
    // Include credentials to allow cookies in cross-origin requests
    const fetchOptions = {
      method: 'GET',
      credentials: 'include' as RequestCredentials,
      headers: {
        'Accept': 'application/json',
      }
    };
    
    // If no saved credentials, try to load from the API
    // We'll try multiple possible endpoints to ensure we find the right one in any environment
    const possibleEndpoints = [
      `${window.location.origin}/api/supabase-config`,
      `${window.location.origin}/api/supabase-config/client`,
      `${window.location.origin}/supabase-config`,
      `${window.location.origin}/supabase-config/client`,
      // Add fallback relative paths that don't depend on origin
      '/api/supabase-config',
      '/api/supabase-config/client',
      '/supabase-config',
      '/supabase-config/client'
    ];
    
    let response = null;
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of possibleEndpoints) {
      try {
        console.log('Attempting to load Supabase config from:', endpoint);
        response = await fetch(endpoint, fetchOptions);
        if (response.ok) {
          console.log('Successfully loaded config from:', endpoint);
          break;
        }
      } catch (error) {
        console.warn(`Failed to load from ${endpoint}:`, error);
        lastError = error;
      }
    }
    
    if (response && response.ok) {
      const config = await response.json();
      console.log('Config received:', !!config);
      
      if (config && config.supabase_url && config.supabase_anon_key) {
        // Save to localStorage for future use
        localStorage.setItem('queuebeats_supabase_url', config.supabase_url);
        localStorage.setItem('queuebeats_supabase_anon_key', config.supabase_anon_key);
        
        return await initializeSupabase(config.supabase_url, config.supabase_anon_key);
      }
    }
    
    // If we got here, API loading failed - try fallback
    console.warn('Failed to load Supabase config from API, using fallback values');
    
    // FALLBACK: hardcoded values as a last resort
    console.log('Using hardcoded Supabase credentials');
    // Using the same credentials we've configured in the Supabase secret keys
    supabaseUrl = 'https://thuqfmfgpodaxxvydbcz.supabase.co';
    supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0';
    
    if (!isInitialized) {
      // Only reinitialize if not already initialized
      reinitializeClient();
    }
    
    // Save these values for future use
    localStorage.setItem('queuebeats_supabase_url', supabaseUrl);
    localStorage.setItem('queuebeats_supabase_anon_key', supabaseAnonKey);
    
    return true;
  } catch (error) {
    console.error('Error loading Supabase config:', error);
    return false;
  }
};

// Create a single supabase client that will be used app-wide
// Using a default initialization that will be updated later
export let supabase: SupabaseClient<Database>;

// Function to initialize the client only if it hasn't been initialized yet
function reinitializeClient() {
  if (!isInitialized && supabaseUrl && supabaseAnonKey) {
    // Create client with debug logging to track issues
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'queuebeats-auth-storage-key',
      }
    });
    console.log('Supabase client initialized with URL:', supabaseUrl.substring(0, 20) + '...');
    isInitialized = true;
  }
}

// Initialize with fallback values if needed to prevent crashes
supabaseUrl = 'https://thuqfmfgpodaxxvydbcz.supabase.co';
supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0';
reinitializeClient();

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get the current session
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return !!session;
};
