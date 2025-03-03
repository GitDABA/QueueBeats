# QueueBeats Deployment Guide

This guide explains how to deploy QueueBeats as a local development setup and for production on Netlify.

## Local Development

### Environment Setup

1. Create a `.env` file in the project root with the following variables:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   FRONTEND_PORT=5173  # Optional, default is 5173
   BACKEND_PORT=8001   # Optional, default is 8001
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Running Locally

You can start both the frontend and backend services using:

```bash
# From project root
npm start
```

Or run them individually:

```bash
# Start backend
cd backend
./run.sh

# Start frontend (in another terminal)
cd frontend
./run.sh
```

## Netlify Deployment

### Prerequisites

1. Create a Netlify account if you don't have one
2. Install the Netlify CLI: `npm install -g netlify-cli`

### Configuration

1. Create a `netlify.toml` file in the project root:
   ```toml
   [build]
     command = "cd frontend && npm install && npm run build"
     publish = "frontend/dist"
     functions = "backend/netlify/functions"

   [dev]
     command = "npm start"
     port = 8888
     targetPort = 5173

   [[redirects]]
     from = "/routes/*"
     to = "/.netlify/functions/api/:splat"
     status = 200

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Set up environment variables in Netlify:
   - Go to your Netlify project dashboard
   - Navigate to Site settings > Environment variables
   - Add the following environment variables:
     ```
     SPOTIFY_CLIENT_ID
     SPOTIFY_CLIENT_SECRET
     SUPABASE_URL
     SUPABASE_ANON_KEY
     SUPABASE_JWT_SECRET
     ```

### Netlify Function for Backend API

Create a serverless function to handle backend API requests:

1. Create a directory for Netlify functions:
   ```bash
   mkdir -p backend/netlify/functions
   ```

2. Create an API handler in `backend/netlify/functions/api.js`:
   ```javascript
   const { createServerAdapter } = require('@whatwg-node/server');
   const { createApp } = require('../../main');

   // Create FastAPI app
   const app = createApp();

   // Create serverless adapter
   const adapter = createServerAdapter(app);

   exports.handler = adapter;
   ```

3. Update your backend dependencies to include Netlify function requirements in `backend/requirements.txt`:
   ```
   fastapi==0.95.1
   uvicorn==0.22.0
   pydantic==1.10.7
   python-dotenv==1.0.0
   requests==2.31.0
   supabase==1.0.3
   python-multipart==0.0.6
   mangum==0.17.0  # For AWS Lambda / Netlify Functions
   ```

### Deployment Steps

1. Login to Netlify CLI:
   ```bash
   netlify login
   ```

2. Initialize Netlify site:
   ```bash
   netlify init
   ```

3. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

## Important Notes

1. **Spotify Configuration**: Make sure to update your Spotify application's redirect URIs to include your Netlify deployment URL.

2. **CORS Configuration**: The backend code already includes CORS configuration for development. For production, update the CORS settings in `main.py` to include your Netlify domain.

3. **Database Migration**: Make sure your Supabase database is properly set up with all the required tables before deploying to production.

4. **Environment Variables**: Double-check all environment variables are properly set in both local development and Netlify settings.

5. **API Routes**: All backend API routes should be accessed through `/routes/` path, which will be redirected to Netlify Functions.

## Troubleshooting

- **API Connection Issues**: Verify the frontend is using the correct API endpoints and that the Netlify redirect rules are properly configured.

- **Authentication Problems**: Check that the JWT secret is properly set and that Supabase configuration is correct.

- **Spotify Integration Errors**: Verify Spotify credentials and ensure redirect URIs are properly configured in the Spotify Developer Dashboard.

- **Function Timeout**: If API calls timeout, check Netlify function logs and consider optimizing your code or increasing the function timeout in Netlify settings.
