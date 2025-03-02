from fastapi import APIRouter, Request
from pydantic import BaseModel
import databutton as db

# Create router with different prefix for alternative access
router = APIRouter(prefix="/api/supabase-config", tags=["config"])

class SupabaseConfigResponse(BaseModel):
    supabase_url: str
    supabase_anon_key: str
    api_base_url: str = ""

def get_supabase_config_internal() -> tuple[str, str]:
    """Internal function to get Supabase configuration with fallback"""
    try:
        # Get Supabase credentials from secrets
        supabase_url = db.secrets.get("SUPABASE_URL")
        supabase_anon_key = db.secrets.get("SUPABASE_ANON_KEY")
        
        # Check if credentials are valid
        if not supabase_url or not supabase_anon_key:
            # Fallback to hardcoded values (same as client-side fallback)
            fallback_url = "https://thuqfmfgpodaxxvydbcz.supabase.co"
            fallback_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0"
            print("Warning: Using fallback Supabase credentials")
            return fallback_url, fallback_key
        
        return supabase_url, supabase_anon_key
        
    except Exception as e:
        print(f"Error getting Supabase config: {str(e)}")
        # Fallback values on exception
        fallback_url = "https://thuqfmfgpodaxxvydbcz.supabase.co"
        fallback_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0"
        return fallback_url, fallback_key

@router.get("/")
def get_supabase_config_alt(request: Request) -> SupabaseConfigResponse:
    """Alternate route for Supabase configuration to avoid CORS issues."""
    try:
        # Get Supabase credentials
        supabase_url, supabase_anon_key = get_supabase_config_internal()
        
        # Get base URL for debugging
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        scheme = forwarded_proto if forwarded_proto else request.url.scheme
        
        forwarded_host = request.headers.get("X-Forwarded-Host")
        host = forwarded_host if forwarded_host else request.headers.get("host", request.url.netloc)
        
        base_url = f"{scheme}://{host}"
        
        return SupabaseConfigResponse(
            supabase_url=supabase_url,
            supabase_anon_key=supabase_anon_key,
            api_base_url=base_url
        )
    except Exception as e:
        # Use try-except to always provide a response
        print(f"Error in get_supabase_config2: {str(e)}")
        
        return SupabaseConfigResponse(
            supabase_url="https://thuqfmfgpodaxxvydbcz.supabase.co",
            supabase_anon_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0",
            api_base_url=str(request.url).split("/api/supabase-config")[0]
        )

@router.get("/client")
def get_supabase_client_config_alt(request: Request) -> SupabaseConfigResponse:
    """Client-specific alternate route for Supabase configuration."""
    return get_supabase_config_alt(request)
