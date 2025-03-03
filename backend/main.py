"""
QueueBeats Backend FastAPI Application

This is the main entry point for the QueueBeats backend API server.
The server is built using FastAPI and provides endpoints for:
- Music queue management
- Spotify integration
- User authentication via Supabase
- Real-time updates

Configuration:
- Server runs on port 8001 by default (configurable via BACKEND_PORT in .env)
- API routes are dynamically loaded from the app/apis directory
- CORS is enabled for development
- Authentication can be disabled per-router via routers.json

API Path Structure:
- Direct endpoints: /debug/health, /debug/supabase - defined in create_app()
- Router endpoints: /routes/{module}/{endpoint} - dynamically loaded from app/apis/
  Example: /routes/debug/health from app/apis/debug/__init__.py

To start the server:
1. Activate the Python virtual environment (done by run.sh)
2. Run: uvicorn main:app --reload --port 8001
   (or simply use ./run.sh)
"""

import os
import pathlib
import json
import dotenv
import sys
from fastapi import FastAPI, APIRouter, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Load environment variables
dotenv.load_dotenv()

# Create mock auth middleware
class AuthConfig:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
            
async def get_authorized_user():
    return {"user_id": "mock-user-id"}


def get_router_config() -> dict:
    try:
        # Note: This file is not available to the agent
        cfg = json.loads(open("routers.json").read())
    except Exception as e:
        print(f"Error loading router config: {e}")
        # Default configuration (all routers with auth disabled)
        return {
            "routers": {
                "supabase": {"disableAuth": True},
                "supabase_config": {"disableAuth": True},
                "supabase_shared": {"disableAuth": True},
                "spotify_auth": {"disableAuth": True},
                "spotify_search": {"disableAuth": True},
                "songs": {"disableAuth": True},
                "debug": {"disableAuth": True},
                "setup": {"disableAuth": True}
            }
        }
    return cfg


def is_auth_disabled(router_config: dict, name: str) -> bool:
    try:
        return router_config["routers"].get(name, {}).get("disableAuth", True)
    except:
        return True


def import_api_routers() -> APIRouter:
    """Create top level router including all user defined endpoints."""
    routes = APIRouter(prefix="/routes")

    router_config = get_router_config()

    src_path = pathlib.Path(__file__).parent

    # Import API routers from "src/app/apis/*/__init__.py"
    apis_path = src_path / "app" / "apis"

    api_names = [
        p.relative_to(apis_path).parent.as_posix()
        for p in apis_path.glob("*/__init__.py")
    ]

    api_module_prefix = "app.apis."

    # Create a special router for Spotify auth that maps to the expected frontend paths
    spotify_router = APIRouter(prefix="/spotify")
    
    print("\n=== REGISTERING API ROUTERS ===")
    for name in api_names:
        print(f"Importing API: {name}")
        try:
            # Import the module
            api_module = __import__(api_module_prefix + name, fromlist=[name])
            api_router = getattr(api_module, "router", None)
            
            if isinstance(api_router, APIRouter):
                # Log all the routes in this router
                for route in api_router.routes:
                    methods = getattr(route, "methods", ["GET"])
                    path = getattr(route, "path", "unknown")
                    print(f"  - Found route: {', '.join(methods)} {path}")
                
                # Special case for spotify_auth to map to /routes/spotify/...
                if name == "spotify_auth":
                    # Include the spotify_auth router directly in the spotify_router
                    spotify_router.include_router(
                        api_router,
                        dependencies=(
                            []
                            if is_auth_disabled(router_config, name)
                            else [Depends(get_authorized_user)]
                        ),
                    )
                    print(f"  > Included in spotify_router: {name}")
                else:
                    # Regular case for other routers
                    routes.include_router(
                        api_router,
                        prefix=f"/{name}",
                        dependencies=(
                            []
                            if is_auth_disabled(router_config, name)
                            else [Depends(get_authorized_user)]
                        ),
                    )
                    print(f"  > Registered at /routes/{name}: {len(api_router.routes)} endpoints")
            else:
                print(f"  ! Warning: No router found in module {name}")
        except Exception as e:
            import traceback
            print(f"Error importing API {name}: {str(e)}")
            traceback.print_exc()
            continue
    
    # Include the spotify_router in the main routes
    routes.include_router(spotify_router)
    
    # Log all configured routes
    print("\n=== ALL REGISTERED API ROUTES ===")
    for route in routes.routes:
        methods = getattr(route, "methods", ["GET"])
        path = getattr(route, "path", "unknown")
        print(f"  {', '.join(methods)} {routes.prefix}{path}")
    print("===============================\n")

    return routes


def create_app() -> FastAPI:
    """Create the app. This is called by uvicorn with the factory option to construct the app object."""
    app = FastAPI()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # For development; restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Type", "Content-Length", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers"],
    )
    
    # Content type middleware to ensure proper content type headers
    class ContentTypeMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            response = await call_next(request)
            
            # If response doesn't have a content-type header, set it to application/json
            if "content-type" not in response.headers and request.headers.get("accept") == "application/json":
                response.headers["content-type"] = "application/json"
                
            return response

    # Add content type middleware
    app.add_middleware(ContentTypeMiddleware)
    
    # Setup enhanced error handling
    try:
        from app.utils.error_handling import setup_error_handlers
        setup_error_handlers(app)
        print("Enhanced error handling enabled")
    except ImportError:
        print("Error handling module not found, using default error handling")
    
    # Add health check endpoint
    @app.get("/debug/health")
    async def health_check():
        return {"status": "healthy", "message": "API is running", "port": os.environ.get("BACKEND_PORT", "8001")}
    
    @app.get("/debug/supabase")
    async def supabase_debug():
        return {"status": "debug", "connection": "supabase debug info"}
    
    app.include_router(import_api_routers())

    # Middleware to add default headers to all responses
    @app.middleware("http")
    async def add_default_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    for route in app.routes:
        if hasattr(route, "methods"):
            for method in route.methods:
                print(f"{method} {route.path}")

    return app


app = create_app()
