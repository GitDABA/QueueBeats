# QueueBeats Supabase Database Setup

This guide will help you set up the Supabase database for the QueueBeats application. The database schema is defined in the `supabase-schema.sql` file.

## Prerequisites

- Supabase account (free tier is sufficient)
- Supabase project created
- Supabase CLI installed (optional, for local development)

## Method 1: Using the Supabase Web Interface

1. Log in to your Supabase account at [app.supabase.io](https://app.supabase.io)
2. Navigate to your QueueBeats project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `supabase-schema.sql` into the query editor
6. Run the query to create all required tables and policies

## Method 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can execute the SQL script using:

```bash
supabase db execute -f supabase-schema.sql
```

## Verifying the Setup

After running the SQL script, verify that the following tables were created:

1. `profiles`
2. `queues`
3. `songs`
4. `votes`
5. `user_settings` (required for Spotify authentication)

You can check this in the Supabase Dashboard under the "Table Editor" section.

## Setting Up Spotify Authentication

For the Spotify authentication to work properly, you need to set up the `user_settings` table which stores Spotify access tokens. We've included a script to create this table:

1. Log in to your Supabase account at [app.supabase.io](https://app.supabase.io)
2. Navigate to your QueueBeats project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `user-settings-setup.sql` into the query editor
6. Run the query to create the table and related functions

This script will:
- Create the `user_settings` table if it doesn't exist
- Set up row-level security policies
- Create triggers to automatically update timestamps
- Add records for existing users
- Grant necessary privileges

### Verifying Spotify Integration

After setting up the `user_settings` table, you should be able to:
1. Log in to your QueueBeats application
2. Navigate to the Spotify integration page
3. Connect your Spotify account
4. The access token and refresh token will be stored in the `user_settings` table

## Setting Up JWT Authentication

For the backend to validate Supabase authentication tokens, you need to configure the JWT secret:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Scroll down to find the JWT Secret (usually begins with "super-secret-jwt-token-...")
4. Copy this JWT Secret

Add it to your environment variables:

```bash
# For local development, add to your .env file
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

### Why This Is Important

The JWT secret is used by the backend to validate the authenticity of authentication tokens sent from the frontend. Without this:

- The backend cannot securely verify user identity
- Any requests requiring authentication might fail with 401 Unauthorized errors
- The application will fall back to insecure token validation methods in development

## Configuration

Make sure your application is properly configured to use your Supabase instance. Update your `.env` file with:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

If you encounter errors during the SQL execution:

1. Check that the Supabase project exists and is accessible
2. Ensure you have the necessary permissions to create tables
3. If there are existing tables, you may need to drop them first or modify the SQL script to handle existing tables

If authentication is not working properly:

1. Verify that the JWT secret is correctly set
2. Check that Row Level Security (RLS) policies are properly configured

## Next Steps

Once your database is set up, you can:

1. Start the frontend application
2. Register a new user (this will automatically create a profile)
3. Create queues and add songs

For more details about the QueueBeats application, refer to the main README.md file.
