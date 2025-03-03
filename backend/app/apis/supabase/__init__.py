from fastapi import APIRouter, Request, HTTPException
from ..supabase_shared import SupabaseConfig, get_config_from_request, MockDatabutton
import os

# Try to import databutton or use mock
try:
    import databutton as db
except ImportError:
    print("Databutton not available in supabase module, using mock")
    db = MockDatabutton()

router = APIRouter(prefix="/supabase", tags=["supabase"])

async def get_supabase():
    """Create and return a Supabase client using environment variables"""
    from supabase import create_client, Client
    
    # Get Supabase credentials from environment variables
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("Supabase credentials not configured. SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing.")
    
    # Create and return the Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    return supabase

@router.get("/config")
def get_supabase_direct_config(request: Request) -> SupabaseConfig:
    """Get Supabase configuration for the frontend"""
    return get_config_from_request(request, db)
