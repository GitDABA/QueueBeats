# QueueBeats API Paths and Port Configuration

This document explains the API path structure and port configuration for the QueueBeats application.

## Port Configuration

The application uses the following ports:

| Component | Default Port | Configuration Variable |
|-----------|-------------|------------------------|
| Frontend (Vite) | 5173 | FRONTEND_PORT in .env |
| Backend (FastAPI) | 8001 | BACKEND_PORT in .env |

## API Path Structure

The backend API follows a consistent path structure:

### 1. Direct Endpoints

These endpoints are defined directly in `backend/main.py` in the `create_app()` function:

- `/debug/health` - Health check endpoint
- `/debug/supabase` - Supabase connection debug info

### 2. Router-based Endpoints

These endpoints are dynamically loaded from modules in the `app/apis` directory and are prefixed with `/routes`:

- `/routes/{module_name}/{module_name}/{endpoint}`

Example:
- `/routes/debug/debug/health` from `app/apis/debug/__init__.py`
- `/routes/spotify/spotify/config` from `app/apis/spotify_auth/__init__.py`
- `/routes/songs/songs/add` from `app/apis/songs/__init__.py`

> Note: The module name appears twice in the path. This is by design in the FastAPI backend implementation.

### 3. Legacy API Paths

For backward compatibility, the application also supports:

- `/api/{endpoint}` - Redirected to `/{endpoint}`

## Frontend API Access

The frontend accesses the API in the following order of preference:

1. Direct endpoints: `/debug/health`
2. Router endpoints: `/routes/debug/debug/health`

The Vite development server is configured to proxy these requests to the FastAPI backend.

## Startup Options

There are multiple ways to start the application:

1. **Recommended**: Use the direct run scripts
   ```
   # In separate terminals:
   cd frontend && ./run.sh
   cd backend && ./run.sh
   ```
   
   Or using make:
   ```
   make run-frontend
   make run-backend
   ```

2. Using npm scripts:
   ```
   npm start
   ```

## Troubleshooting

If you encounter port conflicts when starting the application:

1. Check if another instance is already running on the same port
2. Modify the port configuration in the .env file
3. Use the direct run scripts rather than the npm start command
