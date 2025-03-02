from fastapi import APIRouter, Request, HTTPException
from ..supabase_shared import SupabaseConfig, get_config_from_request, MockDatabutton

# Try to import databutton or use mock
try:
    import databutton as db
except ImportError:
    print("Databutton not available in supabase module, using mock")
    db = MockDatabutton()

router = APIRouter(prefix="/supabase", tags=["supabase"])

@router.get("/config")
def get_supabase_direct_config(request: Request) -> SupabaseConfig:
    """Get Supabase configuration for the frontend"""
    return get_config_from_request(request, db)
