# QueueBeats Authentication Fix Guide

This guide will help you resolve authentication issues in the QueueBeats application. Follow these steps carefully to get your authentication working properly.

## The Problem

The QueueBeats application is experiencing authentication issues with Supabase, including:

1. Connection refused errors to backend server
2. Missing `health_check` table in Supabase
3. JWT validation errors
4. Inconsistent port configuration

## Quick Fix

We've provided a fix script that addresses most of these issues automatically:

```bash
# Make the script executable
chmod +x fix-auth-issues.sh

# Run the script
./fix-auth-issues.sh
```

## Step-by-Step Manual Fix

If you prefer to fix the issues manually, follow these steps:

### 1. Update Backend Port

Ensure the backend is running on port 8001 as configured:

- In `.env` file, set `BACKEND_PORT=8001`
- In `frontend/.env.development`, set `VITE_API_URL=http://localhost:8001`
- In `frontend/src/brain.ts`, update the fallback port to 8001:
  ```typescript
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
  ```

### 2. Create Required Supabase Tables

1. **Create health_check table**:
   - Log in to your Supabase dashboard
   - Navigate to the SQL Editor
   - Execute the SQL in `health_check_setup.sql`

2. **Create user_settings table (if it doesn't exist)**:
   - Execute the SQL in `user-settings-setup.sql`

### 3. Configure JWT Secret

For proper authentication, set the JWT secret:

1. In your Supabase dashboard, go to Settings > API
2. Copy the JWT Secret 
3. Add it to your `.env` file:
   ```
   SUPABASE_JWT_SECRET=your_jwt_secret_here
   ```

## Verification

To verify your fix:

1. Start the backend: `cd backend && uvicorn main:app --reload --port 8001`
2. Start the frontend: `cd frontend && npm run dev`
3. Test the health check: http://localhost:8001/debug/health
4. Test authentication: Sign in to the application

## Troubleshooting

If you're still experiencing issues:

### Backend Connection Problems

- Check if backend is running: `lsof -i :8001`
- Verify no firewall issues: `curl http://localhost:8001/debug/health`

### Supabase Authentication Issues

- Check browser console for authentication errors
- Verify Supabase URL and keys match in both backend and frontend
- Check that JWT secret is correctly set
- Try logging out and back in to refresh tokens

### Database Table Issues

- Verify the health_check table exists: Run `SELECT * FROM public.health_check;` in Supabase SQL Editor
- Verify user_settings table: Run `SELECT * FROM public.user_settings;`

## Technical Details

The fix addressed these technical issues:

1. **Port configuration**: Ensured consistent use of port 8001 throughout the codebase
2. **Health check table**: Added the missing table in Supabase
3. **JWT validation**: Enhanced error handling for JWT validation
4. **Environment configuration**: Ensured consistent configuration between frontend and backend
5. **Error handling**: Added comprehensive error reporting

If you need further assistance, please refer to the `SUPABASE_SETUP.md` and `SPOTIFY_SETUP.md` guides.
