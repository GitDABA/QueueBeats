# QueueBeats API Path Structure

## Understanding the API Module Path Structure

The QueueBeats backend API follows a specific pattern that involves a duplicated module name in the URL path. This document explains why this happens and how to correctly construct API endpoint URLs.

## Path Structure

The actual path structure for API endpoints is:

```
/routes/{module_name}/{module_name}/{endpoint}
```

For example:
- `/routes/songs/songs/add`
- `/routes/debug/debug/health`
- `/routes/spotify_search/spotify/search`

## Why the Duplication?

This structure comes from how FastAPI creates nested routers:

1. The main router is created with a prefix of `/routes`
2. Each API module is then included with its own prefix (e.g., `/songs`)
3. Each module defines its own router with a prefix (also `/songs`)

The router prefixes are combined, resulting in the path pattern:
`/routes/{module_name}/{module_name}/{endpoint}`

## Code Implementation

In `backend/main.py`, the router structure is created as follows:

```python
# Main router with prefix "/routes"
routes = APIRouter(prefix="/routes")

# For each module (e.g., "songs"):
routes.include_router(
    api_router,  # This is the module's router (e.g., with prefix "/songs")
    prefix=f"/{name}",  # This adds another prefix with the module name
    dependencies=(...),
)
```

In each module (e.g., `backend/app/apis/songs/__init__.py`), the router is defined as:

```python
# Creates router with prefix "/songs"
router = APIRouter(prefix="/songs")

# Then endpoints are added to this router
@router.post("/add")
def add_song_to_queue(request: AddSongRequest):
    # ...
```

## Correct Usage in Frontend

When making API requests from the frontend, always use the full path:

```typescript
// Correct way to call the songs/add endpoint
const apiEndpoint = '/routes/songs/songs/add';

// Incorrect - will result in 404 Not Found
// const apiEndpoint = '/routes/songs/add';
```

## Special Cases

Some API modules might have different internal router prefixes:

1. **Modules with a router prefix**:
   ```python
   # Example: backend/app/apis/songs/__init__.py
   router = APIRouter(prefix="/songs")
   ```
   Path structure: `/routes/songs/songs/endpoint`

2. **Modules without a router prefix**:
   ```python
   # Example: backend/app/apis/spotify_search/__init__.py
   router = APIRouter()  # No prefix
   ```
   Path structure: `/routes/spotify_search/endpoint`
   
   For these modules, the endpoint is defined with the full path:
   ```python
   @router.get("/spotify/search")
   ```
   So the final path is: `/routes/spotify_search/spotify/search`

Always check the actual path by:

1. Examining the FastAPI documentation at `/docs`
2. Checking the router definition in the module's `__init__.py` file
3. Looking at the server startup logs where all routes are printed
