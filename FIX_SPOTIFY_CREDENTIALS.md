# Fix for Spotify Authentication in Netlify Functions

The current Spotify client credentials in your environment files are being rejected by Spotify with an `invalid_client` error. This means the credentials are no longer valid.

## Steps to Fix the Issue

### 1. Create a New Spotify App

Follow these steps to create your own Spotify app and obtain valid credentials:

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and log in
2. Click "Create App"
3. Fill in the application details:
   - **App name**: QueueBeats
   - **App description**: Collaborative music queue application
   - **Website**: `http://localhost:5173` (for local development)
   - **Redirect URI**: `http://localhost:5173/spotify-callback`
4. Accept the terms and conditions
5. Click "Create"

### 2. Get Your New Client ID and Secret

1. After creating the app, you'll see your new **Client ID** on the dashboard
2. Click "Show Client Secret" to reveal your new **Client Secret**
3. Copy both values

### 3. Update Your Environment Variables

Replace the current invalid credentials in your `.env` file:

```
# Spotify Configuration
SPOTIFY_CLIENT_ID=your_new_client_id
SPOTIFY_CLIENT_SECRET=your_new_client_secret
```

### 4. Configure Redirect URIs

1. In your Spotify app dashboard, click on "Edit Settings"
2. Ensure you have the following Redirect URIs:
   - `http://localhost:5173/spotify-callback` (for local development)
   - `http://localhost:8888/spotify-callback` (for Netlify Dev)
   - Your Netlify app URL + `/spotify-callback` (for production)
3. Click "Save"

### 5. Restart Your Netlify Dev Server

After updating your credentials:

1. Stop any running Netlify Dev servers
2. Start a fresh server with:
   ```
   ./run-netlify-dev.sh
   ```

### 6. Verify the Fix

Test your updated credentials with:

```
node test-spotify-auth.js
```

If successful, you should see a message confirming that the token was obtained and a search test was successful.

## Additional Notes

- The error "invalid_client" specifically indicates that the client ID or client secret is invalid
- Spotify credentials occasionally need to be refreshed or recreated if the app hasn't been used in a while
- Always keep your Spotify client secret secure and never expose it in client-side code
