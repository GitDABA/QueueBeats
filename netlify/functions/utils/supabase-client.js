// Supabase client utility for Netlify Functions
const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a Supabase client with anonymous key (public access)
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase client with service role key (admin access)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get a token-authenticated Supabase client
const getSupabaseWithAuth = (authToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  });
};

module.exports = {
  supabasePublic,
  supabaseAdmin,
  getSupabaseWithAuth
};
