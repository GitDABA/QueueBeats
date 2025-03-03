from fastapi import APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import sys
import platform
from pydantic import BaseModel
from typing import Dict, Any, Optional
import httpx
import asyncio

# Define router with debug tag for easy filtering in API docs
router = APIRouter(prefix="/debug", tags=["debug"])

class HealthCheckResponse(BaseModel):
    status: str
    message: str
    api_version: str = "1.0.0"
    environment: str = "production"

class RequestInfoResponse(BaseModel):
    headers: Dict[str, str]
    url: str
    method: str
    client: Dict[str, Any]
    base_url: str

class SystemInfoResponse(BaseModel):
    python_version: str
    platform: str
    env_variables: Dict[str, str]
    server_time: str

class SupabaseHealthResponse(BaseModel):
    status: str
    supabase_url: str
    connection_ok: bool
    error: Optional[str] = None
    health_check_table_exists: bool = False

class SupabaseConnectionTestResponse(BaseModel):
    status: str
    url: str
    project_id: str
    message: str
    error: Optional[str] = None
    connection_latency_ms: Optional[float] = None
    tables_tested: Optional[list] = None
    tables_available: Optional[list] = None

class MockQueueResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    creator_id: str
    created_at: str
    updated_at: str
    is_active: bool = True
    code: Optional[str] = None
    current_song_id: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    songs: list = []

@router.get("/health", summary="Health check endpoint", response_model=HealthCheckResponse)
def debug_health_check() -> HealthCheckResponse:
    """Simple health check endpoint to verify API connectivity.
    Returns a success response with basic API details."""
    import datetime
    
    # Get the current environment
    try:
        from app.env import Mode, mode
        env = "production" if mode == Mode.PROD else "development"
    except ImportError:
        env = "unknown"
    
    return HealthCheckResponse(
        status="ok",
        message="QueueBeats API is running normally",
        api_version="1.0.1",  # Increment with significant changes
        environment=env
    )

@router.get("/request", summary="Request debug info", response_model=RequestInfoResponse)
def debug_request(request: Request) -> RequestInfoResponse:
    """Debug endpoint that returns detailed information about the current request.
    Useful for diagnosing connection and CORS issues."""
    try:
        # Extract request information
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        scheme = forwarded_proto if forwarded_proto else request.url.scheme
        
        forwarded_host = request.headers.get("X-Forwarded-Host")
        host = forwarded_host if forwarded_host else request.headers.get("host", request.url.netloc)
        
        base_url = f"{scheme}://{host}"
        
        client_info = {
            "host": request.client.host if request.client else "unknown",
            "port": request.client.port if request.client else "unknown"
        }
        
        headers_dict = {key: value for key, value in request.headers.items()}
        
        return RequestInfoResponse(
            headers=headers_dict,
            url=str(request.url),
            method=request.method,
            client=client_info,
            base_url=base_url
        )
    except Exception as e:
        # Return error data instead of raising an exception
        # This ensures we get diagnostic info even when things break
        error_info = {
            "error": str(e),
            "error_type": type(e).__name__,
        }
        
        return JSONResponse(
            status_code=200,  # Return 200 even for errors to ensure response gets back to client
            content={
                "headers": dict(request.headers),
                "url": str(request.url),
                "method": request.method,
                "client": {"error": "Could not retrieve client info"},
                "base_url": str(request.url).split("/debug")[0],
                "error_details": error_info
            }
        )

@router.get("/system", summary="System debug info", response_model=SystemInfoResponse)
def debug_system_info() -> SystemInfoResponse:
    """Returns system information for debugging deployment environment issues."""
    import datetime
    
    # Get relevant environment variables (filtering out sensitive ones)
    env_vars = {}
    for key, value in os.environ.items():
        # Only include relevant variables, skip sensitive ones
        if any(keyword in key.lower() for keyword in ["app", "api", "url", "path", "host", "route", "port"]):
            if not any(sensitive in key.lower() for sensitive in ["key", "secret", "password", "token"]):
                env_vars[key] = value
    
    return SystemInfoResponse(
        python_version=sys.version,
        platform=platform.platform(),
        env_variables=env_vars,
        server_time=datetime.datetime.now().isoformat()
    )

@router.get("/supabase", summary="Check Supabase connection", response_model=SupabaseHealthResponse)
async def check_supabase():
    """Check connectivity to Supabase and verify the health_check table exists."""
    try:
        # Get Supabase credentials
        supabase_url = os.environ.get("SUPABASE_URL", "https://thuqfmfgpodaxxvydbcz.supabase.co")
        supabase_key = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0")
        
        # Create HTTP client with timeout
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Try to access the health_check table
            headers = {
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}"
            }
            
            response = await client.get(
                f"{supabase_url}/rest/v1/health_check?select=id,status&limit=1",
                headers=headers
            )
            
            # Check if health_check table exists
            if response.status_code == 200:
                return SupabaseHealthResponse(
                    status="ok",
                    supabase_url=supabase_url,
                    connection_ok=True,
                    health_check_table_exists=True
                )
            elif response.status_code == 404:
                # Table might not exist, try to create it
                return SupabaseHealthResponse(
                    status="warning",
                    supabase_url=supabase_url,
                    connection_ok=True,
                    health_check_table_exists=False,
                    error="health_check table not found"
                )
            else:
                return SupabaseHealthResponse(
                    status="error",
                    supabase_url=supabase_url,
                    connection_ok=False,
                    error=f"Supabase returned status code {response.status_code}: {response.text}"
                )
                
    except Exception as e:
        return SupabaseHealthResponse(
            status="error",
            supabase_url=os.environ.get("SUPABASE_URL", "https://thuqfmfgpodaxxvydbcz.supabase.co"),
            connection_ok=False,
            error=str(e)
        )

@router.get("/connection-test", summary="Test Supabase connectivity", response_model=SupabaseConnectionTestResponse)
async def test_supabase_connection():
    """
    Comprehensive Supabase connection test that checks:
    - API connection
    - Authentication
    - Table access
    - Response times
    
    Returns detailed diagnostics about the connection status.
    """
    import time
    import os
    from app.apis.supabase import get_supabase

    start_time = time.time()
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY")
    project_id = supabase_url.split(".")[-2] if supabase_url else "unknown"
    
    if not supabase_url or not supabase_key:
        return SupabaseConnectionTestResponse(
            status="error",
            url=supabase_url or "not_set",
            project_id=project_id,
            message="Supabase credentials not configured",
            error="SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing",
        )
    
    try:
        # Try to connect to Supabase
        supabase = await get_supabase()
        
        # Test table access
        tables_to_test = ["health_check", "songs", "playlists", "users"]
        tables_available = []
        
        for table in tables_to_test:
            try:
                # Just check if we can query the table
                await supabase.table(table).select("*").limit(1).execute()
                tables_available.append(table)
            except Exception as e:
                # Table doesn't exist or can't be accessed
                pass
                
        end_time = time.time()
        latency = (end_time - start_time) * 1000  # Convert to milliseconds
        
        return SupabaseConnectionTestResponse(
            status="success",
            url=supabase_url,
            project_id=project_id,
            message="Successfully connected to Supabase",
            connection_latency_ms=latency,
            tables_tested=tables_to_test,
            tables_available=tables_available
        )
    except Exception as e:
        end_time = time.time()
        latency = (end_time - start_time) * 1000
        
        return SupabaseConnectionTestResponse(
            status="error",
            url=supabase_url,
            project_id=project_id,
            message="Failed to connect to Supabase",
            error=str(e),
            connection_latency_ms=latency
        )

@router.get("/mock-queue/{queue_id}", summary="Get mock queue data for testing", response_model=MockQueueResponse)
async def get_mock_queue(queue_id: str, user_id: Optional[str] = None):
    """
    Returns mock queue data for testing frontend without Supabase.
    This bypasses the 406 errors from Supabase and helps test the frontend.
    """
    # Create mock songs list with the songs added via the API
    mock_songs = []
    try:
        # Try to read from a "persistent" source
        import json
        import os
        cache_path = os.path.join(os.path.dirname(__file__), "mock_songs.json")
        if os.path.exists(cache_path):
            with open(cache_path, "r") as f:
                mock_songs = json.load(f)
    except Exception as e:
        print(f"Error loading mock songs: {e}")
        # Fallback to default songs
        mock_songs = [
            {
                "id": "1",
                "title": "Blinding Lights",
                "artist": "The Weeknd",
                "album": "After Hours",
                "cover_url": "https://i.scdn.co/image/ab67616d0000b273ca7718c5cbd2f3c9cd84aba1",
                "added_by": user_id or "00000000-0000-0000-0000-000000000000",
                "created_at": "2024-01-01T00:00:00"
            }
        ]
    
    return {
        "id": queue_id,
        "name": "Test Queue",
        "description": "This is a mock queue for testing",
        "creator_id": user_id or "00000000-0000-0000-0000-000000000000", 
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
        "is_active": True,
        "code": "TESTCODE",
        "current_song_id": None,
        "settings": {
            "allow_guest_add": True,
            "allow_guest_vote": True
        },
        "songs": mock_songs
    }
