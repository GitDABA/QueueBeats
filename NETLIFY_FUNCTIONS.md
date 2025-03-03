# Netlify Functions Guide for QueueBeats

This document explains how to work with Netlify Functions in the QueueBeats application, including setup, development, and troubleshooting.

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Local Development](#local-development)
4. [Available Functions](#available-functions)
5. [Troubleshooting](#troubleshooting)
6. [Environment Variables](#environment-variables)

## Introduction

QueueBeats uses Netlify Functions as serverless backend functions to handle various operations:

- Database health checks
- Spotify API integration
- Song queue management
- Other backend operations that require server-side execution

These functions run on Netlify's infrastructure in production but can be run locally during development.

## Project Structure

The Netlify Functions are structured as follows:

```
netlify/
├── functions/
│   ├── database-health-check.js       # Database health check function
│   ├── spotify-search.js              # Spotify search API function
│   ├── songs-add.js                   # Add songs to queue function
│   ├── env-test.js                    # Environment variable testing function
│   ├── package.json                   # Dependencies for functions
│   └── utils/                         # Shared utilities
│       ├── cors-headers.js            # CORS headers for all functions
│       └── load-env.js                # Environment variable loader
```

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Netlify CLI (`npm install -g netlify-cli`)

### Running Functions Locally

You can run the Netlify Functions locally in two ways:

#### Option 1: Using the provided npm script

```bash
# From the root directory
npm run netlify:dev
```

#### Option 2: Using the Netlify CLI directly

```bash
# From the root directory
netlify dev
```

This will start a local development server at http://localhost:8888 that simulates the Netlify environment.

### Testing Functions

To test the functions locally, you can use the provided test script:

```bash
# From the root directory
npm run netlify:test
```

This interactive script will test the Spotify search and song addition functions.

## Available Functions

### spotify-search

Searches for tracks on Spotify.

**Endpoint**: `/.netlify/functions/spotify-search`  
**Method**: GET  
**Parameters**:
- `query` (required): The search query
- `limit` (optional): Maximum number of results to return (default: 10)

**Example**:
```
http://localhost:8888/.netlify/functions/spotify-search?query=dancing&limit=5
```

### songs-add

Adds a song to a queue.

**Endpoint**: `/.netlify/functions/songs-add`  
**Method**: POST  
**Body**:
```json
{
  "queue_id": "your-queue-id",
  "song_id": "spotify-track-id",
  "user_id": "user-who-added-song"
}
```

**Example**:
```bash
curl -X POST http://localhost:8888/.netlify/functions/songs-add \
  -H "Content-Type: application/json" \
  -d '{"queue_id":"queue123","song_id":"track456","user_id":"user789"}'
```

### database-health-check

Checks the health of the Supabase database connection.

**Endpoint**: `/.netlify/functions/database-health-check`  
**Method**: GET

### env-test

Tests environment variable loading and checks if all required variables are present.

**Endpoint**: `/.netlify/functions/env-test`  
**Method**: GET  
**Response**: JSON object with environment variable status (without exposing actual values)

**Example**:
```
http://localhost:8888/.netlify/functions/env-test
```

## Troubleshooting

### Common Issues

1. **"Missing Spotify credentials" Error**
   - Make sure your `.env.netlify` file includes `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
   - Verify these values are correct in the Spotify Developer Dashboard

2. **"Missing Supabase credentials" Error**
   - Make sure your `.env.netlify` file includes `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Check that the Supabase project is active

3. **CORS Issues**
   - All functions include CORS headers, but you may need to update them if using a custom domain
   - Edit `netlify/functions/utils/cors-headers.js` if needed

4. **Function Not Found**
   - Check that the function file exists in `netlify/functions/`
   - Verify the URL path is correct (should be `/.netlify/functions/[function-name]`)
   - Make sure the function is exported correctly (use `exports.handler = async function(...)`)

### Debugging

To enable verbose logging for Netlify Functions:

```bash
# Set debug flag when running
DEBUG=* netlify dev
```

## Environment Variables

The following environment variables are used by the Netlify Functions:

| Variable | Purpose | Where to Set |
|----------|---------|--------------|
| `SPOTIFY_CLIENT_ID` | Spotify API authentication | `.env.netlify` |
| `SPOTIFY_CLIENT_SECRET` | Spotify API authentication | `.env.netlify` |
| `SUPABASE_URL` | Supabase connection | `.env.netlify` |
| `SUPABASE_ANON_KEY` | Supabase authentication | `.env.netlify` |

### Setting Up Environment Variables

For local development:

1. Create a `.env.netlify` file in the project root directory
2. Add the required environment variables

For production:

1. Go to the Netlify Dashboard
2. Navigate to your site > Site settings > Environment variables
3. Add each environment variable
