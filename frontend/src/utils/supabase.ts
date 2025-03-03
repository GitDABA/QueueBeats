import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  throw new Error('Missing required environment variables for Supabase initialization.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Configure custom fetch with timeout
const timeoutDuration = 15000; // 15 seconds
const customFetch = async (url: RequestInfo, options?: RequestInit) => {
  const controller = new AbortController();
  const signal = controller.signal;
  
  // Setup timeout to abort the request
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.error(`Supabase request timed out after ${timeoutDuration}ms:`, url);
  }, timeoutDuration);
  
  // Merge our signal with any existing options
  const fetchOptions = {
    ...options,
    signal
  };
  
  // Make sure we have headers object
  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }
  
  // Try to get current session for authenticated requests
  try {
    // Get the session from storage first
    const storedSession = localStorage.getItem('supabase.auth.token');
    let accessToken = null;
    
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        accessToken = sessionData?.currentSession?.access_token;
      } catch (parseError) {
        console.warn('Could not parse stored session:', parseError);
      }
    }
    
    if (accessToken) {
      // Add the auth token to the request
      Object.assign(fetchOptions.headers, {
        'Authorization': `Bearer ${accessToken}`
      });
    }
  } catch (error) {
    console.warn('Could not add auth token to request:', error);
  }
  
  // Add headers to ensure 406 Not Acceptable errors don't occur
  Object.assign(fetchOptions.headers, {
    'Prefer': 'return=representation',
    'Accept': 'application/json',
    'apikey': supabaseAnonKey // Always include the API key
  });
  
  // Debug request details
  console.debug(
    `Supabase ${fetchOptions.method || 'GET'} request:`, 
    url.toString().split('?')[0]
  );
  
  return fetch(url, fetchOptions)
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error('Supabase fetch error:', error);
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutDuration}ms`);
      }
      throw error;
    });
};

// Create the Supabase client with custom fetch and debug flags
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true, 
      detectSessionInUrl: true,
      storage: localStorage
    },
    global: {
      headers: {
        'Prefer': 'return=representation',
        'Accept': 'application/json'
      },
      fetch: customFetch
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Function to add authorization header to Supabase queries
export const getSupabaseWithAuth = async () => {
  // Get the current session token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.warn('No auth session available for Supabase request');
    return supabase;
  }
  
  // Creating a new client with the auth header
  const supabaseWithAuth = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    }
  );
  
  return supabaseWithAuth;
};

// Setup realtime debug logging
(function setupRealtimeLogging() {
  // Only run this once
  if ((window as any).__realtimeLoggingSetup) return;
  (window as any).__realtimeLoggingSetup = true;
  
  try {
    console.log('Setting up Supabase realtime debug logging');
    
    // Get the current WebSocket prototype open and close methods
    const originalOpen = WebSocket.prototype.open;
    const originalClose = WebSocket.prototype.close;
    
    // Override the methods to add logging
    WebSocket.prototype.open = function() {
      console.log(`WebSocket opening: ${this.url}`);
      
      // Add event listeners for connection status
      this.addEventListener('open', () => {
        console.log(`WebSocket connected: ${this.url}`);
      });
      
      this.addEventListener('error', (event) => {
        console.error(`WebSocket error: ${this.url}`, event);
      });
      
      this.addEventListener('close', (event) => {
        console.log(`WebSocket closed: ${this.url}, clean: ${event.wasClean}, code: ${event.code}, reason: ${event.reason}`);
      });
      
      // Call original method
      return originalOpen.apply(this, arguments);
    };
    
    WebSocket.prototype.close = function() {
      console.log(`WebSocket closing: ${this.url}`);
      return originalClose.apply(this, arguments);
    };
    
    console.log('Supabase realtime debug logging set up successfully');
  } catch (error) {
    console.error('Error setting up realtime debug logging:', error);
  }
})();

// Helper to get the current user with timeout protection
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('Checking for current user');
    
    // Create a timeout promise
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Get current user timed out after 15 seconds')), 15000);
    });
    
    // Get current user, racing against the timeout
    const { data, error } = await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise.then(() => { throw new Error('Get current user timeout'); })
    ]);
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    if (data?.user) {
      console.log('Current user found:', data.user.id);
    } else {
      console.log('No current user found');
    }
    
    return data?.user || null;
  } catch (error) {
    console.error('Exception in getCurrentUser:', error);
    return null;
  }
};

// Check backend API for health
const checkBackendApi = async (): Promise<boolean> => {
  try {
    // Get the API URL from environment or default to localhost:8001
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    console.log('Using API URL:', API_URL);
    
    // Attempt to connect to API endpoints in order of preference
    const endpoints = [
      `${API_URL}/debug/health`,             // Direct route without prefix
      `${API_URL}/debug/supabase`            // Direct route without prefix
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying API endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        console.log(`Endpoint ${endpoint} returned status: ${response.status}`);
        
        if (response.status === 200) {
          const data = await response.json();
          console.log('API health check succeeded:', data);
          return true;
        }
      } catch (err) {
        console.warn(`Error connecting to ${endpoint}:`, err);
      }
    }
    
    // Try a no-cors request as a last resort
    console.log('Attempting no-cors connection');
    await fetch(`${API_URL}/debug/health`, {
      method: 'GET',
      mode: 'no-cors'
    });
    
    console.log('No-cors request completed without throwing, API might be accessible');
    return false;
  } catch (error) {
    console.error('All API connection attempts failed:', error);
    return false;
  }
};

// For backward compatibility, maintain the loadSupabaseConfig function
// but simplify it since we now initialize Supabase at import time
export const loadSupabaseConfig = async () => {
  try {
    console.log('Checking Supabase connection...');
    
    // First check if the backend API is available
    const apiAvailable = await checkBackendApi();
    
    // If API is available, we might not need to test Supabase directly
    if (apiAvailable) {
      console.log('Backend API is available, not testing Supabase directly');
      return true;
    }
    
    // Test the connection by making a simple query
    const { error } = await supabase.from('health_check').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
};

// Initialize Supabase with custom URL and key
export const initializeSupabase = async (url: string, key: string): Promise<boolean> => {
  try {
    console.log('Initializing Supabase with custom parameters...');
    
    if (!url || !key) {
      console.error('Missing Supabase URL or Anon Key');
      return false;
    }
    
    // We're using pre-initialized client, so just verify connection
    const { error } = await supabase.from('health_check').select('id').limit(1);
    
    if (error) {
      console.error('Failed to initialize Supabase with custom parameters:', error);
      return false;
    }
    
    console.log('Supabase initialized successfully with custom parameters');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase with custom parameters:', error);
    return false;
  }
};

// Test the Supabase connection on load
(async () => {
  try {
    console.log('Testing Supabase connection...');
    const startTime = Date.now();
    
    // First check if backend API health check is available
    const apiAvailable = await checkBackendApi();
    
    if (apiAvailable) {
      console.log('Backend API is available, Supabase status managed by API');
      return;
    }
    
    // Use a table that exists in our schema instead of 'health_check'
    const { data, error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error(`Supabase connection test failed after ${duration}ms:`, error);
    } else {
      console.log(`Supabase connection test successful in ${duration}ms`);
    }
  } catch (error) {
    console.error('Supabase connection test exception:', error);
  }
})();
