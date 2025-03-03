# QueueBeats Netlify Functions

This directory contains serverless functions for the QueueBeats application that run on Netlify.

## Available Functions

- `spotify-search.js` - Searches Spotify for tracks matching a query
- `songs-add.js` - Adds a song to a queue in the database
- More functions to be added as needed...

## Utility Files

- `utils/cors-headers.js` - Provides CORS headers for all functions
- `utils/load-env.js` - Handles environment variable loading for functions

## Local Development

To use these functions in local development:

1. Make sure you have the Netlify CLI installed: `npm install -g netlify-cli`
2. Create an `.env.netlify` file in the project root with the necessary environment variables
3. Run `netlify dev` from the project root to start the Netlify development server
4. Functions will be available at `http://localhost:8888/.netlify/functions/[function-name]`

## Environment Variables

The following environment variables should be defined in `.env.netlify`:

- `SPOTIFY_CLIENT_ID` - Spotify API client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify API client secret
- `SUPABASE_URL` - URL of your Supabase project
- `SUPABASE_ANON_KEY` - Anon/public key for Supabase client

## Configuration

Functions are configured in the `netlify.toml` file in the project root. This includes redirects that map frontend API routes to Netlify Functions.
