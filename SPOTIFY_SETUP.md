# QueueBeats Spotify Integration Setup

This guide will help you set up the Spotify integration for the QueueBeats application. 

## Prerequisites

1. A Spotify account (free or premium)
2. Access to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
3. QueueBeats backend server running
4. Supabase database configured with the `user_settings` table (see SUPABASE_SETUP.md)

## Step 1: Create a Spotify Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and log in
2. Click "Create App"
3. Fill in the application details:
   - **App name**: QueueBeats
   - **App description**: Collaborative music queue application
   - **Website**: Your application URL (e.g., http://localhost:5173 for local development)
   - **Redirect URI**: Your application callback URL (e.g., http://localhost:5173/spotify-callback)
4. Accept the terms and conditions
5. Click "Create"

## Step 2: Configure Redirect URIs

1. After creating the app, click on "Edit Settings"
2. Add the following Redirect URIs:
   - `http://localhost:5173/spotify-callback` (for local development)
   - Your Netlify app URL + `/spotify-callback` (for production deployment)
3. Click "Save"

## Step 3: Get Your Client ID and Secret

1. On your app's dashboard, you'll see your **Client ID**
2. Click "Show Client Secret" to reveal your **Client Secret**
3. Keep these values secure — you'll need them for the next step

## Step 4: Configure QueueBeats Environment Variables

Add your Spotify credentials to the appropriate environment locations:

### For Local Development

1. In your `.env` file at the project root, add:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

### For Netlify Deployment

1. Go to your Netlify dashboard and select your app
2. Navigate to Site settings > Environment variables
3. Add the following environment variables:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

## Step 5: Configure Required Scopes

The QueueBeats application requires the following Spotify API scopes:

- `streaming`: Play music content
- `user-read-email`: Access user's email address
- `user-read-private`: Access user's subscription details
- `user-library-read`: Access user's saved tracks
- `user-read-playback-state`: Read user's player state
- `user-modify-playback-state`: Control playback
- `user-read-currently-playing`: Read currently playing track

These scopes are already configured in the frontend code and will be requested when a user connects their Spotify account.

## Step 6: Set Up the User Settings Table

To store Spotify tokens, you need to set up the `user_settings` table in your Supabase database. 

Run the SQL script provided in `user-settings-setup.sql` in the Supabase SQL editor to create the table with the appropriate structure and security policies.

See the `SUPABASE_SETUP.md` file for detailed instructions on setting up your database.

## Step 7: Test the Integration

1. Start both the backend and frontend servers
2. Sign in to QueueBeats
3. Navigate to your profile or settings page
4. Click "Connect Spotify"
5. You'll be redirected to Spotify's authorization page
6. Grant permissions to the app
7. You'll be redirected back to QueueBeats with your Spotify account connected

## Step 8: Configure JWT Authentication

For the backend to properly validate authentication tokens, you need to set the JWT secret:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Scroll down to find the JWT Secret (usually begins with "super-secret-jwt-token-...")
4. Copy this JWT Secret

Then add it to your environment:

```bash
# For local development, add to your .env file
SUPABASE_JWT_SECRET=your_jwt_secret_here

# For Netlify, add this as an environment variable in the Netlify dashboard
```

**Important**: Without the JWT Secret properly set, the backend will fall back to insecure token validation, which should only be used for development.

## Troubleshooting

### Token Exchange Failing

If you're having trouble exchanging the authorization code for tokens:

1. Check that your redirect URI exactly matches what's registered in the Spotify Developer Dashboard
2. Verify that your client ID and secret are correct
3. Ensure that the required scopes are being requested
4. Check the backend logs for specific error messages

### Tokens Not Being Stored

If tokens are not being stored in the database:

1. Verify that the `user_settings` table exists in your Supabase database
2. Check that the table has the correct structure with columns for `spotify_access_token` and `spotify_refresh_token`
3. Ensure that Row Level Security (RLS) policies are properly configured

### Playback Not Working

If playback is not working:

1. Ensure you're using a Spotify Premium account (required for playback control)
2. Check that you've granted all the necessary permissions
3. Verify that you have an active Spotify device available

## Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Authentication Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)
- [Netlify Environment Variables Documentation](https://docs.netlify.com/configure-builds/environment-variables/)
