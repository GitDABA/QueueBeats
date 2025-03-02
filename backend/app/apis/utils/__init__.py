from fastapi import Request, APIRouter
from pydantic import BaseModel

# Create a router for the utils API
router = APIRouter(prefix="/utils", tags=["utils"])

class ApiResponse(BaseModel):
    success: bool
    message: str

class UrlInfo(BaseModel):
    base_url: str
    api_url: str

@router.get("/")
def get_api_info(request: Request) -> ApiResponse:
    """Health check endpoint for the utils API"""
    return ApiResponse(
        success=True,
        message="Utils API is healthy"
    )

@router.get("/url-info")
def get_url_info(request: Request) -> UrlInfo:
    """Get URL information for the API"""
    base_url = get_base_url(request)
    return UrlInfo(
        base_url=base_url,
        api_url=f"{base_url}/api"
    )

def get_base_url(request: Request) -> str:
    """
    Get the base URL for the application based on the request,
    accounting for possible proxies or deployments.
    
    Args:
        request: The FastAPI Request object
        
    Returns:
        The base URL string including protocol, host, and port if applicable
    """
    # Get the scheme (http or https)
    forwarded_proto = request.headers.get("X-Forwarded-Proto")
    scheme = forwarded_proto if forwarded_proto else request.url.scheme
    
    # Get the host (might include port)
    forwarded_host = request.headers.get("X-Forwarded-Host")
    host = forwarded_host if forwarded_host else request.headers.get("host", request.url.netloc)
    
    # Build the base URL
    base_url = f"{scheme}://{host}"
    
    return base_url
