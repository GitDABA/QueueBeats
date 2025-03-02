from fastapi import APIRouter, HTTPException, Request
import databutton as db
from pydantic import BaseModel

# Define get_base_url locally to avoid circular imports
def get_base_url(request: Request) -> str:
    """Get the base URL from request headers"""
    forwarded_proto = request.headers.get("X-Forwarded-Proto")
    scheme = forwarded_proto if forwarded_proto else request.url.scheme
    
    forwarded_host = request.headers.get("X-Forwarded-Host")
    host = forwarded_host if forwarded_host else request.headers.get("host", request.url.netloc)
    
    return f"{scheme}://{host}"

router = APIRouter(prefix="/supabase-config2", tags=["config"])

class SupabaseConfigResponse(BaseModel):
    supabase_url: str
    supabase_anon_key: str
    api_base_url: str = ""

@router.get("/")
def get_supabase_config2(request: Request) -> SupabaseConfigResponse:
    """Get the Supabase configuration details needed for the frontend."""
    try:
        # Get Supabase credentials from secrets
        supabase_url = db.secrets.get("SUPABASE_URL")
        supabase_anon_key = db.secrets.get("SUPABASE_ANON_KEY")
        
        # Get base URL to help with debugging deployment issues
        base_url = get_base_url(request)
        
        if not supabase_url or not supabase_anon_key:
            raise HTTPException(
                status_code=500, 
                detail="Supabase configuration not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets."
            )
        
        return SupabaseConfigResponse(
            supabase_url=supabase_url,
            supabase_anon_key=supabase_anon_key,
            api_base_url=base_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
