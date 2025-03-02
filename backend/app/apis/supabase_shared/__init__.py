from pydantic import BaseModel
from typing import Optional
import os

class SupabaseConfig(BaseModel):
    supabase_url: str
    supabase_anon_key: str
    api_base_url: str

# Create mock for databutton if not available
class MockDatabutton:
    class Secrets:
        def get(self, key):
            return os.environ.get(key)
    
    secrets = Secrets()

try:
    import databutton as db_import
    db = db_import
except ImportError:
    print("Databutton not available in supabase_shared, using mock")
    db = MockDatabutton()

def get_config_from_request(request, db_module=None):
    """Shared function to get Supabase configuration from request and DB"""
    # Use the passed db_module if provided, otherwise use the module-level db
    db_to_use = db_module if db_module is not None else db
    
    try:
        # Get the base URL for the API
        scheme = request.url.scheme
        host = request.headers.get("host", request.url.netloc)
        base_url = f"{scheme}://{host}"
        
        # Get Supabase credentials with fallback
        supabase_url = db_to_use.secrets.get("SUPABASE_URL")
        supabase_anon_key = db_to_use.secrets.get("SUPABASE_ANON_KEY")
        
        # Check if credentials are valid
        if not supabase_url or not supabase_anon_key:
            # Fallback values or environment variables
            import os
            supabase_url = os.environ.get("SUPABASE_URL", "https://thuqfmfgpodaxxvydbcz.supabase.co")
            supabase_anon_key = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0")
        
        # Return the configuration
        return SupabaseConfig(
            supabase_url=supabase_url,
            supabase_anon_key=supabase_anon_key,
            api_base_url=base_url
        )
    except Exception as e:
        print(f"Error in get_supabase_config: {str(e)}")
        # Fallback on error
        return SupabaseConfig(
            supabase_url="https://thuqfmfgpodaxxvydbcz.supabase.co",
            supabase_anon_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodXFmbWZncG9kYXh4dnlkYmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTQyNzgsImV4cCI6MjA1NjQzMDI3OH0.jYnRbXoGR9lliBLj_L0D1jundPXa2SV55Enp04w8YO0",
            api_base_url="https://queuebeats.databutton.app"
        )
