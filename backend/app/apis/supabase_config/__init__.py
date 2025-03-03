from fastapi import APIRouter, HTTPException, Request
import os
from typing import Tuple, Optional
from ..supabase_shared import SupabaseConfig, get_config_from_request, MockDatabutton

# Try to import databutton or use mock
try:
    import databutton as db
except ImportError:
    print("Databutton not available in supabase_config, using mock")
    db = MockDatabutton()

# Define get_base_url locally to avoid circular imports
def get_base_url(request: Request) -> str:
    """Get the base URL from request headers"""
    forwarded_proto = request.headers.get("X-Forwarded-Proto")
    scheme = forwarded_proto if forwarded_proto else request.url.scheme
    
    forwarded_host = request.headers.get("X-Forwarded-Host")
    host = forwarded_host if forwarded_host else request.headers.get("host", request.url.netloc)
    
    return f"{scheme}://{host}"

# Create router with CORS enabled
router = APIRouter(prefix="/supabase-config", tags=["config"])

def get_supabase_config_internal() -> tuple[str, str]:
    """Internal function to get Supabase configuration with fallback"""
    try:
        # Get Supabase credentials from secrets or environment
        supabase_url = db.secrets.get("SUPABASE_URL") or os.environ.get("SUPABASE_URL")
        supabase_anon_key = db.secrets.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_ANON_KEY")
        
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
        fallback_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0"
        return fallback_url, fallback_key

def get_supabase_config() -> dict:
    """
    Get Supabase configuration as a dictionary for use in API endpoints.
    
    Returns:
        dict: Dictionary with url and anon_key
    """
    url, anon_key = get_supabase_config_internal()
    return {
        "url": url,
        "anon_key": anon_key
    }

@router.get("/")
def get_supabase_config(request: Request) -> SupabaseConfig:
    """Get the Supabase configuration details needed for the frontend."""
    return get_config_from_request(request, db)

@router.get("/client")
def get_supabase_client_config(request: Request) -> SupabaseConfig:
    """Client-specific endpoint for Supabase configuration. 
    This is a dedicated endpoint for frontend use to reduce CORS issues."""
    return get_config_from_request(request, db)