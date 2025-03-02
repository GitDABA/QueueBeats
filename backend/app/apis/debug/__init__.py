from fastapi import APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import sys
import platform
from pydantic import BaseModel
from typing import Dict, Any, Optional

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

