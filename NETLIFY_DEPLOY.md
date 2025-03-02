# Deploying QueueBeats to Netlify

This guide explains how to deploy the QueueBeats application to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. A [Supabase account](https://supabase.com) with your project set up
3. [GitHub repository](https://github.com) with your QueueBeats code
4. [Node.js](https://nodejs.org/) (v18 or later) and [npm](https://www.npmjs.com/)

## Setup Steps

### 1. Configure Environment Variables

In the Netlify UI, navigate to **Site settings** > **Environment variables** and add the following:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SPOTIFY_CLIENT_ID`: Your Spotify application client ID (if using Spotify features)
- `SPOTIFY_CLIENT_SECRET`: Your Spotify application client secret (if using Spotify features)

### 2. Deploy to Netlify

#### Option 1: Deploy via Netlify UI

1. Log in to Netlify
2. Click "New site from Git"
3. Select your repository
4. Set build command to: `npm run build:netlify`
5. Set publish directory to: `frontend/dist`
6. Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Log in: `netlify login`
3. Link your repository: `netlify init`
4. Deploy: `netlify deploy --prod`

### 3. Configure Redirects

The `netlify.toml` file in the root of the project already includes the necessary redirects:

- API requests (`/api/*`) are directed to Netlify Functions
- All other routes fall back to the SPA frontend (`index.html`)

## Troubleshooting

- **API 404 errors**: Ensure your API routes are prefixed with `/api` in the frontend
- **Function errors**: Check Netlify function logs in the Netlify dashboard
- **CORS issues**: Make sure your Supabase project has the correct CORS configuration

## Customizing for Production

1. Update the `netlify.toml` file if you need different build settings
2. Modify the `backend/netlify/functions/api.js` file to adjust how API requests are handled
