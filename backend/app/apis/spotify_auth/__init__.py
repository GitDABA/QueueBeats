from fastapi import APIRouter, HTTPException, Request, Depends, Header
from pydantic import BaseModel
import requests
import json
from typing import Optional
from datetime import datetime, timedelta
import os
from supabase import create_client, Client
from app.utils.auth import get_user_id

router = APIRouter()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print(f"Supabase client initialized for spotify_auth")
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
else:
    print("Missing Supabase credentials, token storage will not be available")

# Define request and response models
class SpotifyAuthRequest(BaseModel):
    code: str
    redirect_uri: str
    user_id: Optional[str] = None

class SpotifyAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int

class SpotifyTokenRequest(BaseModel):
    refresh_token: str
    user_id: Optional[str] = None

class SpotifyConfigResponse(BaseModel):
    client_id: str
    redirect_uri: str

class SpotifyErrorResponse(BaseModel):
    error: str
    error_description: Optional[str] = None

@router.get("/config", response_model=SpotifyConfigResponse)
def get_spotify_config() -> SpotifyConfigResponse:
    """
    Get Spotify client ID and redirect URI
    """
    try:
        # Get client ID from environment variables
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        if not client_id:
            raise HTTPException(status_code=500, detail="Spotify client ID not configured. Please set SPOTIFY_CLIENT_ID environment variable.")
            
        # Return config
        return SpotifyConfigResponse(
            client_id=client_id,
            redirect_uri="" # Frontend will set this
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/token", response_model=SpotifyAuthResponse)
def exchange_code_for_token(
    request: SpotifyAuthRequest, 
    authorization: Optional[str] = Header(None)
) -> SpotifyAuthResponse:
    """
    Exchange authorization code for access token and store in Supabase
    """
    try:
        # Get client ID and secret from environment variables
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            raise HTTPException(status_code=500, detail="Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.")
        
        # Exchange code for token
        token_url = "https://accounts.spotify.com/api/token"
        
        auth_header = requests.auth._basic_auth_str(client_id, client_secret)
        
        payload = {
            "grant_type": "authorization_code",
            "code": request.code,
            "redirect_uri": request.redirect_uri
        }
        
        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        
        response = requests.post(token_url, data=payload, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            raise HTTPException(
                status_code=response.status_code,
                detail=error_data.get("error_description", "Failed to exchange code for token")
            )
        
        token_data = response.json()
        
        # Extract user_id from authorization header or request body
        user_id = request.user_id
        if not user_id and authorization and authorization.startswith("Bearer "):
            try:
                user_id = get_user_id(authorization.split(" ")[1])
            except Exception as e:
                print(f"Error extracting user_id from token: {e}")
        
        # Store tokens in Supabase if user_id is available
        if user_id and supabase:
            try:
                # Calculate expiration time
                expires_at = datetime.now() + timedelta(seconds=token_data["expires_in"])
                
                # Store tokens in Supabase
                data, error = supabase.table("user_settings").upsert({
                    "user_id": user_id,
                    "spotify_access_token": token_data["access_token"],
                    "spotify_refresh_token": token_data["refresh_token"],
                    "spotify_token_expires_at": expires_at.isoformat(),
                    "updated_at": datetime.now().isoformat()
                }).execute()
                
                if error:
                    print(f"Error storing Spotify tokens: {error}")
            except Exception as e:
                print(f"Error saving Spotify tokens to Supabase: {e}")
        
        return SpotifyAuthResponse(
            access_token=token_data["access_token"],
            refresh_token=token_data["refresh_token"],
            expires_in=token_data["expires_in"]
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refresh", response_model=SpotifyAuthResponse)
def refresh_token(
    request: SpotifyTokenRequest,
    authorization: Optional[str] = Header(None)
) -> SpotifyAuthResponse:
    """
    Refresh an expired access token and update in Supabase
    """
    try:
        # Get client ID and secret from environment variables
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            raise HTTPException(status_code=500, detail="Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.")
        
        # Refresh the token
        token_url = "https://accounts.spotify.com/api/token"
        
        auth_header = requests.auth._basic_auth_str(client_id, client_secret)
        
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": request.refresh_token
        }
        
        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        
        response = requests.post(token_url, data=payload, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            raise HTTPException(
                status_code=response.status_code,
                detail=error_data.get("error_description", "Failed to refresh token")
            )
        
        token_data = response.json()
        
        # The response might not include a refresh token, in which case use the old one
        refresh_token = token_data.get("refresh_token", request.refresh_token)
        
        # Extract user_id from authorization header or request body
        user_id = request.user_id
        if not user_id and authorization and authorization.startswith("Bearer "):
            try:
                user_id = get_user_id(authorization.split(" ")[1])
            except Exception as e:
                print(f"Error extracting user_id from token: {e}")
        
        # Update tokens in Supabase if user_id is available
        if user_id and supabase:
            try:
                # Calculate expiration time
                expires_at = datetime.now() + timedelta(seconds=token_data["expires_in"])
                
                # Update tokens in Supabase
                data, error = supabase.table("user_settings").upsert({
                    "user_id": user_id,
                    "spotify_access_token": token_data["access_token"],
                    "spotify_refresh_token": refresh_token,
                    "spotify_token_expires_at": expires_at.isoformat(),
                    "updated_at": datetime.now().isoformat()
                }).execute()
                
                if error:
                    print(f"Error updating Spotify tokens: {error}")
            except Exception as e:
                print(f"Error updating Spotify tokens in Supabase: {e}")
        
        return SpotifyAuthResponse(
            access_token=token_data["access_token"],
            refresh_token=refresh_token,
            expires_in=token_data["expires_in"]
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tokens/{user_id}", response_model=dict)
def get_user_spotify_tokens(user_id: str, authorization: Optional[str] = Header(None)):
    """
    Get the Spotify tokens for a user from Supabase
    """
    try:
        # Detailed logging for debugging
        print(f"Getting Spotify tokens for user_id: {user_id}")
        print(f"Authorization header present: {authorization is not None}")
        
        # Need to access the global supabase client
        global supabase
        
        if not supabase:
            print("Supabase client not configured, attempting to initialize")
            # Try to initialize Supabase client if it's not already initialized
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_ANON_KEY")
            
            if not supabase_url or not supabase_key:
                # Try to get from environment again
                supabase_url = os.environ.get("SUPABASE_URL")
                supabase_key = os.environ.get("SUPABASE_ANON_KEY")
                
                if not supabase_url or not supabase_key:
                    raise HTTPException(
                        status_code=500, 
                        detail="Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY."
                    )
            
            try:
                supabase = create_client(supabase_url, supabase_key)
                print(f"Supabase client initialized dynamically")
            except Exception as init_error:
                print(f"Error initializing Supabase client: {init_error}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to initialize Supabase client: {str(init_error)}"
                )
        
        # In development, allow token-less requests for easier testing
        if os.environ.get("APP_ENV") == "development" and not authorization:
            print("Development mode: proceeding without token verification")
            requester_id = user_id  # Trust the request in development
        else:
            # Verify the requesting user is authorized to access this user's tokens
            if authorization and authorization.startswith("Bearer "):
                token = authorization.split(" ")[1]
                try:
                    requester_id = get_user_id(token)
                    print(f"Requester ID from token: {requester_id}")
                    
                    if requester_id != user_id:
                        print(f"Auth mismatch: requester {requester_id} != requested {user_id}")
                        raise HTTPException(
                            status_code=403, 
                            detail="Not authorized to access this user's tokens"
                        )
                except HTTPException as he:
                    print(f"HTTP exception in token validation: {he.detail}")
                    raise he
                except Exception as token_error:
                    print(f"Error validating token: {token_error}")
                    raise HTTPException(
                        status_code=401, 
                        detail=f"Invalid authentication token: {str(token_error)}"
                    )
            else:
                print("Missing or invalid Authorization header")
                
                # For development: override if APP_ENV is set
                if os.environ.get("APP_ENV") == "development":
                    print("Development mode: proceeding despite missing token")
                else:
                    raise HTTPException(
                        status_code=401, 
                        detail="Authentication required. Authorization header must start with 'Bearer '"
                    )
        
        # Get tokens from Supabase
        print(f"Querying Supabase for user settings: user_id={user_id}")
        try:
            data = supabase.table("user_settings").select(
                "spotify_access_token, spotify_refresh_token, spotify_token_expires_at"
            ).eq("user_id", user_id).execute()
            
            if hasattr(data, 'error') and data.error:
                print(f"Supabase query error: {data.error}")
                raise HTTPException(status_code=500, detail=f"Database error: {data.error}")
            
            if not hasattr(data, 'data') or not data.data or len(data.data) == 0:
                print(f"No Spotify tokens found for user {user_id}")
                raise HTTPException(status_code=404, detail="Spotify tokens not found for this user")
            
            user_settings = data.data[0]
            print(f"Found user settings for {user_id}")
            
            # Ensure all required fields exist
            if not all(k in user_settings for k in ["spotify_access_token", "spotify_refresh_token", "spotify_token_expires_at"]):
                missing = [k for k in ["spotify_access_token", "spotify_refresh_token", "spotify_token_expires_at"] 
                          if k not in user_settings]
                print(f"Missing fields in user_settings: {missing}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Incomplete Spotify settings: missing {', '.join(missing)}"
                )
            
            # Check if token is expired
            expires_at_str = user_settings["spotify_token_expires_at"]
            if not expires_at_str:
                print(f"Missing expiry time for user {user_id}")
                return {
                    "access_token": None,
                    "refresh_token": user_settings["spotify_refresh_token"],
                    "expired": True,
                    "message": "Token expiry time missing, refresh required"
                }
            
            # Handle different datetime formats
            try:
                if 'Z' in expires_at_str:
                    expires_at = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
                else:
                    expires_at = datetime.fromisoformat(expires_at_str)
                
                now = datetime.now()
                
                # If token is expired, indicate refresh is needed
                if now >= expires_at:
                    print(f"Token expired for user {user_id}: {expires_at} < {now}")
                    return {
                        "access_token": None,
                        "refresh_token": user_settings["spotify_refresh_token"],
                        "expired": True,
                        "message": "Token expired, refresh required"
                    }
                
                print(f"Returning valid token for user {user_id}, expires: {expires_at}")
                return {
                    "access_token": user_settings["spotify_access_token"],
                    "refresh_token": user_settings["spotify_refresh_token"],
                    "expires_at": expires_at_str,
                    "expired": False
                }
            except ValueError as date_error:
                print(f"Invalid date format: {expires_at_str}: {date_error}")
                return {
                    "access_token": None, 
                    "refresh_token": user_settings["spotify_refresh_token"],
                    "expired": True,
                    "message": f"Invalid expiry date format: {expires_at_str}"
                }
                
        except Exception as db_error:
            print(f"Database access error: {db_error}")
            # Check if this is a 404 error (tokens not found)
            if "404" in str(db_error) and "not found" in str(db_error).lower():
                # Return an empty result instead of an error
                return {
                    "access_token": None,
                    "refresh_token": None,
                    "expired": True,
                    "message": "No Spotify tokens found for this user"
                }
            else:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error accessing token database: {str(db_error)}"
                )
            
    except HTTPException as he:
        print(f"Re-raising HTTP exception: {he.detail}")
        raise he
    except Exception as e:
        print(f"Unexpected error in get_user_spotify_tokens: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
