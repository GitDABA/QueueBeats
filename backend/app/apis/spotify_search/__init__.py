from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
import databutton as db
import requests
from typing import List, Optional

router = APIRouter()

# Models
class SpotifyTrack(BaseModel):
    id: str
    name: str
    uri: str
    artists: List[str]
    album: str
    album_art: str
    duration_ms: int
    popularity: Optional[int] = None
    preview_url: Optional[str] = None

class SearchResponse(BaseModel):
    tracks: List[SpotifyTrack]

class SearchError(BaseModel):
    error: str

@router.get("/spotify/search")
def search_spotify_songs(
    query: str = Query(..., description="Search query for songs"),
    limit: int = Query(10, description="Maximum number of results to return", ge=1, le=50)
) -> SearchResponse:
    """
    Search for songs on Spotify
    """
    try:
        # Get client ID and secret from secrets
        client_id = db.secrets.get("SPOTIFY_CLIENT_ID")
        client_secret = db.secrets.get("SPOTIFY_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            raise HTTPException(status_code=500, detail="Spotify credentials not configured")
        
        # Get Spotify access token using Client Credentials flow
        token_url = "https://accounts.spotify.com/api/token"
        auth_data = {
            "grant_type": "client_credentials"
        }
        auth_headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        auth_response = requests.post(
            token_url,
            data=auth_data,
            headers=auth_headers,
            auth=(client_id, client_secret)
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to authenticate with Spotify")
        
        auth_data = auth_response.json()
        access_token = auth_data["access_token"]
        
        # Search for tracks using Spotify API
        search_url = "https://api.spotify.com/v1/search"
        search_params = {
            "q": query,
            "type": "track",
            "limit": limit
        }
        search_headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        search_response = requests.get(search_url, params=search_params, headers=search_headers)
        
        if search_response.status_code != 200:
            error_data = search_response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            raise HTTPException(status_code=search_response.status_code, detail=f"Spotify search failed: {error_msg}")
        
        search_data = search_response.json()
        
        # Process results
        result_tracks = []
        for item in search_data["tracks"]["items"]:
            track = SpotifyTrack(
                id=item["id"],
                name=item["name"],
                uri=item["uri"],
                artists=[artist["name"] for artist in item["artists"]],
                album=item["album"]["name"],
                album_art=item["album"]["images"][0]["url"] if item["album"]["images"] else "",
                duration_ms=item["duration_ms"],
                popularity=item["popularity"],
                preview_url=item["preview_url"]
            )
            result_tracks.append(track)
        
        return SearchResponse(tracks=result_tracks)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
