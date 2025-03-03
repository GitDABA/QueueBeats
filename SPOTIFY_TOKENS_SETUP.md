# Spotify Tokens Table Setup Guide

QueueBeats uses a dedicated `spotify_tokens` table to securely store Spotify authentication tokens. This document explains the automatic setup process and how to handle any issues that might arise.

## Automatic Setup Process

When a user attempts to connect to Spotify, QueueBeats will:

1. Check if the `spotify_tokens` table exists
2. If the table doesn't exist, automatically redirect to a setup page
3. The setup page will attempt to create the necessary database table using one of several methods:
   - First, try using a Supabase RPC function
   - If that fails, use a Netlify serverless function
   - Display friendly error messages if setup cannot be completed

## Manual Setup

If the automatic setup fails, you can manually set up the required database table using the following steps:

### Option 1: Using the Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the SQL from `create_spotify_tokens_function.sql`
5. Run the query to create the functions
6. Then execute: `SELECT create_spotify_tokens_table();`

### Option 2: Using Migration Scripts

You can also use the migration script provided in `spotify_tokens_setup.sql`:

1. Navigate to the Supabase SQL Editor
2. Create a new query
3. Copy and paste the contents of `spotify_tokens_setup.sql`
4. Run the query

## Troubleshooting

### Common Errors

1. **"Table does not exist" error**
   - This indicates the table hasn't been created yet
   - Follow the automatic setup process
   - If it fails, try the manual setup steps

2. **Permission errors**
   - Ensure your Supabase service role key has sufficient permissions
   - Check that RLS policies are properly configured

3. **Setup page keeps redirecting**
   - Clear your browser cache
   - Ensure your Supabase connection is working
   - Check Netlify environment variables

### Required Environment Variables

The automatic setup process requires the following environment variables to be set in your Netlify dashboard:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: The anon/public key (for client-side operations)
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key (for admin operations in Netlify functions)

## Table Structure

The `spotify_tokens` table has the following structure:

```sql
CREATE TABLE public.spotify_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX spotify_tokens_user_id_idx ON public.spotify_tokens(user_id);

-- Unique constraint to ensure one set of tokens per user
ALTER TABLE public.spotify_tokens ADD CONSTRAINT spotify_tokens_user_id_key UNIQUE (user_id);

-- Row-level security
ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tokens
CREATE POLICY "Users can only access their own tokens"
  ON public.spotify_tokens
  FOR ALL
  USING (auth.uid() = user_id);
```

## Support

If you encounter any issues with the Spotify integration or database setup, please contact our support team or open an issue on the GitHub repository.
