from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
import databutton as db
import requests
import json
from typing import Optional

router = APIRouter()

# Define request and response models
class SpotifyAuthRequest(BaseModel):
    code: str
    redirect_uri: str

class SpotifyAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int

class SpotifyTokenRequest(BaseModel):
    refresh_token: str

class SpotifyConfigResponse(BaseModel):
    client_id: str
    redirect_uri: str

class SpotifyErrorResponse(BaseModel):
    error: str
    error_description: Optional[str] = None

@router.get("/spotify/config")
def get_spotify_config() -> SpotifyConfigResponse:
    """
    Get Spotify client ID and redirect URI
    """
    try:
        # Get client ID from secrets
        client_id = db.secrets.get("SPOTIFY_CLIENT_ID")
        if not client_id:
            raise HTTPException(status_code=500, detail="Spotify client ID not configured")
            
        # Return config
        return SpotifyConfigResponse(
            client_id=client_id,
            redirect_uri="" # Frontend will set this
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/spotify/token")
def exchange_code_for_token(request: SpotifyAuthRequest) -> SpotifyAuthResponse:
    """
    Exchange authorization code for access token
    """
    try:
        # Get client ID and secret from secrets
        client_id = db.secrets.get("SPOTIFY_CLIENT_ID")
        client_secret = db.secrets.get("SPOTIFY_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            raise HTTPException(status_code=500, detail="Spotify credentials not configured")
        
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
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        response = requests.post(token_url, data=payload, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            raise HTTPException(
                status_code=response.status_code,
                detail=error_data.get("error_description", "Failed to exchange code for token")
            )
        
        token_data = response.json()
        
        return SpotifyAuthResponse(
            access_token=token_data["access_token"],
            refresh_token=token_data["refresh_token"],
            expires_in=token_data["expires_in"]
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/spotify/refresh")
def refresh_token(request: SpotifyTokenRequest) -> SpotifyAuthResponse:
    """
    Refresh an expired access token
    """
    try:
        # Get client ID and secret from secrets
        client_id = db.secrets.get("SPOTIFY_CLIENT_ID")
        client_secret = db.secrets.get("SPOTIFY_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            raise HTTPException(status_code=500, detail="Spotify credentials not configured")
        
        # Refresh the token
        token_url = "https://accounts.spotify.com/api/token"
        
        auth_header = requests.auth._basic_auth_str(client_id, client_secret)
        
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": request.refresh_token
        }
        
        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/x-www-form-urlencoded"
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
        
        return SpotifyAuthResponse(
            access_token=token_data["access_token"],
            refresh_token=refresh_token,
            expires_in=token_data["expires_in"]
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
