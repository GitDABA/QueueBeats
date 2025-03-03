# QueueBeats Troubleshooting Guide

This document provides solutions for common issues encountered in the QueueBeats application.

## 1. Database Connection Issues

### Symptoms
- 500 errors when accessing application
- Console errors showing "Database connection failed"
- Tables not found errors

### Solutions

#### Check Database Health
```javascript
// Run this in the browser console to check database health
import('./src/utils/databaseHealth.js').then(module => {
  module.checkDatabaseHealth().then(console.log);
});
```

#### Verify Environment Variables
Ensure these are correctly set in your `.env.development` or Netlify environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for Netlify functions)

#### Run SQL Setup Script
If tables are missing, try running the health check setup script:
```bash
# Local development
psql -U postgres -d your_database_name < health_check_setup.sql

# Or through Supabase dashboard
# Copy contents of health_check_setup.sql and run in SQL Editor
```

## 2. Spotify API Issues

### Symptoms
- 401 Unauthorized errors
- 404 Not Found when searching for tracks
- "Failed to refresh token" errors

### Solutions

#### Check Spotify Credentials
Verify these environment variables are set:
- `VITE_SPOTIFY_CLIENT_ID`
- `VITE_SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI` (matches your app's redirect URI)

#### Check Token Storage
Verify the tokens are being stored correctly:
```javascript
// Run in browser console
const { data, error } = await supabase
  .from('spotify_credentials')
  .select('*')
  .eq('user_id', currentUserId);
console.log(data, error);
```

#### Reconnect Spotify
Have your users disconnect and reconnect their Spotify account:
1. Go to Profile settings
2. Click "Disconnect Spotify"
3. Click "Connect Spotify"

#### Debug Token Issues
If you're experiencing Spotify token issues, check these common causes:
- Token expiration without proper refresh
- Missing environment variables
- Invalid redirect URI
- Incorrect scopes during authentication

## 3. Netlify Function Issues

### Symptoms
- 404 errors when calling Netlify functions
- Functions timing out
- CORS errors

### Solutions

#### Check Netlify Configuration
Verify your `netlify.toml` file has the correct redirects:
```toml
[[redirects]]
  from = "/spotify/search"
  to = "/.netlify/functions/spotify-search"
  status = 200
  force = true
```

#### Check Function Deployment
Ensure your functions were properly deployed:
1. Go to Netlify dashboard
2. Navigate to Functions
3. Verify that your functions are listed

#### Enable CORS Headers
Ensure all functions include the proper CORS headers:
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};
```

## 4. Frontend Issues

### Symptoms
- App loads but features don't work
- Authentication issues
- Console errors

### Solutions

#### Check Browser Console
Always check browser console (F12) for error messages which can point to specific issues.

#### Clear Cache and Hard Reload
Clear browser cache and do a hard reload:
1. Open Dev Tools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"

#### Check Route Issues
If specific routes don't work, verify:
1. Route definitions in your app
2. Netlify redirects configuration 
3. Authentication state if it's a protected route

## 5. Development vs Production Issues

### Common Differences to Check
- Environment variables
- API endpoints (local vs deployed)
- Authentication flow
- CORS settings

### Local Development
For local development:
1. Use `.env.development` for environment variables
2. Run backend server on port 8001 (or as configured)
3. Run frontend on port 5173 with `npm run dev`

### Production
For production deployment:
1. Set all environment variables in Netlify dashboard
2. Test with `netlify dev` to simulate production
3. If issues persist in production but not locally, check networking/CORS

## 6. Row Level Security Issues

### Symptoms
- Unauthorized errors on database operations
- Data not showing even though it exists
- Permission denied errors

### Solutions
#### Check RLS Policies
Verify RLS policies are correctly configured in Supabase:
```sql
-- Example policy for queues table
CREATE POLICY "Users can view their own queues"
  ON public.queues
  FOR SELECT
  USING (auth.uid() = creator_id);
```

#### Service Role Usage
For Netlify functions that need to bypass RLS:
```javascript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

## Need More Help?

If you're still experiencing issues:
1. Check the application logs
2. Look for specific error messages in browser console
3. Verify all environment variables are set correctly
4. Review recent code changes that might have introduced the issue

For database-specific issues, run a health check via Netlify function:
```
GET /.netlify/functions/database-health-check
```

This should help identify and resolve the most common issues encountered in the QueueBeats application.
