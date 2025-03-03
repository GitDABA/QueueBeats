# Netlify Functions Environment Variables Setup

This document explains how environment variables are configured for the Netlify functions in the QueueBeats application.

## Overview

Netlify functions require access to environment variables like `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to interact with the Supabase database and other services. We use two methods to ensure these variables are properly loaded:

1. Direct loading in functions using `dotenv`
2. Environment variable loading in the `run-netlify-dev.sh` script

## Key Environment Variables

For the Netlify functions to work properly, the following environment variables must be defined in your `.env` file:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Spotify Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## How Environment Variables Are Loaded

### 1. In the Netlify Functions

Each Netlify function uses the `dotenv` package to load environment variables from the root `.env` file:

```javascript
// At the top of each function file:
require('dotenv').config(); // Load environment variables from .env file
```

### 2. In the run-netlify-dev.sh Script

The `run-netlify-dev.sh` script also exports all environment variables from the `.env` file:

```bash
# Load environment variables from .env file
if [ -f ".env" ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo "Warning: .env file not found. Environment variables may be missing."
fi
```

## Troubleshooting

If you encounter issues with environment variables in Netlify functions:

1. Ensure your `.env` file contains all required variables (see above)
2. Try running the functions using the provided test script: `node test-db-function.js`
3. Check the Netlify Dev server logs for any environment-related errors
4. Verify that the `dotenv` package is installed in the `netlify/functions` directory

## Deployment Considerations

When deploying to Netlify, you will need to set these same environment variables in the Netlify dashboard under:
Site settings > Build & deploy > Environment variables

This ensures your production functions have access to the same configuration as your local development environment.
