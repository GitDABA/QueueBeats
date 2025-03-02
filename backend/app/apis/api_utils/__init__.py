from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

# Create router
router = APIRouter(prefix="/api-utils", tags=["utils"])

class ApiInfoResponse(BaseModel):
    status: str
    message: str
    base_url: str

@router.get("/info")
def get_api_info2(request: Request) -> ApiInfoResponse:
    """Get API connection information. This is a simple endpoint to test API connectivity.
    It returns basic info about the API connection, including the detected base URL."""
    try:
        # Get scheme and host from request
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        scheme = forwarded_proto if forwarded_proto else request.url.scheme
        
        forwarded_host = request.headers.get("X-Forwarded-Host")
        host = forwarded_host if forwarded_host else request.headers.get("host", request.url.netloc)
        
        base_url = f"{scheme}://{host}"
        
        return ApiInfoResponse(
            status="ok",
            message="API is connected and functioning normally",
            base_url=base_url
        )
    except Exception as e:
        # Return error info instead of raising exception
        # This ensures the frontend always gets a response
        return ApiInfoResponse(
            status="error",
            message=f"API encountered an error: {str(e)}",
            base_url=str(request.url).split("/api-utils")[0]
        )
