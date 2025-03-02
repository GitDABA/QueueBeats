import os
import pathlib
import json
import dotenv
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
dotenv.load_dotenv()

# Create mock for databutton if not available
class MockDatabutton:
    class Secrets:
        def get(self, key):
            return os.environ.get(key)
    
    secrets = Secrets()

try:
    import databutton as db
except ImportError:
    print("Databutton not available, using mock")
    db = MockDatabutton()

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

    for name in api_names:
        print(f"Importing API: {name}")
        try:
            api_module = __import__(api_module_prefix + name, fromlist=[name])
            api_router = getattr(api_module, "router", None)
            if isinstance(api_router, APIRouter):
                routes.include_router(
                    api_router,
                    dependencies=(
                        []
                        if is_auth_disabled(router_config, name)
                        else [Depends(get_authorized_user)]
                    ),
                )
        except Exception as e:
            print(f"Error importing API {name}: {e}")
            continue

    print(routes.routes)

    return routes


def get_firebase_config() -> dict | None:
    extensions = os.environ.get("DATABUTTON_EXTENSIONS", "[]")
    try:
        extensions = json.loads(extensions)

        for ext in extensions:
            if ext["name"] == "firebase-auth":
                return ext["config"]["firebaseConfig"]
    except:
        pass

    return None


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
    )
    
    app.include_router(import_api_routers())

    for route in app.routes:
        if hasattr(route, "methods"):
            for method in route.methods:
                print(f"{method} {route.path}")

    firebase_config = get_firebase_config()

    if firebase_config is None:
        print("No firebase config found")
        app.state.auth_config = None
    else:
        print("Firebase config found")
        auth_config = {
            "jwks_url": "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
            "audience": firebase_config["projectId"],
            "header": "authorization",
        }

        app.state.auth_config = AuthConfig(**auth_config)

    return app


app = create_app()
