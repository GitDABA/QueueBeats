from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
import requests
from typing import List, Optional
import os

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

def get_spotify_credentials():
    """Get Spotify credentials from environment variables"""
    client_id = os.environ.get("SPOTIFY_CLIENT_ID")
    client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
    
    return client_id, client_secret

@router.get("/spotify/search", response_model=SearchResponse, response_model_exclude_none=True)
def search_spotify_songs(
    query: str = Query(..., description="Search query for songs"),
    limit: int = Query(10, description="Maximum number of results to return", ge=1, le=50)
) -> SearchResponse:
    """
    Search for songs on Spotify
    """
    try:
        # Log the incoming request parameters for debugging
        print(f"Spotify search request: query='{query}', limit={limit}")
        
        # Get client ID and secret from environment variables
        client_id, client_secret = get_spotify_credentials()
        
        # Print debug info (redact sensitive information)
        print(f"Spotify credentials available: client_id={client_id is not None}, client_secret={client_secret is not None}")
        
        if not client_id or not client_secret:
            raise HTTPException(status_code=500, detail="Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.")
        
        # Get Spotify access token using Client Credentials flow
        token_url = "https://accounts.spotify.com/api/token"
        auth_data = {
            "grant_type": "client_credentials"
        }
        auth_headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        
        try:
            auth_response = requests.post(
                token_url,
                data=auth_data,
                headers=auth_headers,
                auth=(client_id, client_secret)
            )
            
            print(f"Spotify auth response: status_code={auth_response.status_code}")
            
            if auth_response.status_code != 200:
                error_content = auth_response.text
                print(f"Auth error content: {error_content}")
                raise HTTPException(status_code=500, detail=f"Failed to authenticate with Spotify: {error_content}")
            
            auth_data = auth_response.json()
            access_token = auth_data["access_token"]
            print("Successfully obtained Spotify access token")
            
        except Exception as e:
            print(f"Exception during Spotify authentication: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error during Spotify authentication: {str(e)}")
        
        # Search for tracks using Spotify API
        search_url = "https://api.spotify.com/v1/search"
        search_params = {
            "q": query,
            "type": "track",
            "limit": limit
        }
        search_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
        
        try:
            print(f"Making Spotify search request: url={search_url}, params={search_params}")
            search_response = requests.get(search_url, params=search_params, headers=search_headers)
            
            print(f"Spotify search response: status_code={search_response.status_code}")
            
            if search_response.status_code != 200:
                error_content = search_response.text
                print(f"Search error content: {error_content}")
                error_data = search_response.json() if search_response.text else {"error": {"message": "Unknown error"}}
                error_msg = error_data.get("error", {}).get("message", "Unknown error")
                raise HTTPException(status_code=search_response.status_code, detail=f"Spotify search failed: {error_msg}")
            
            search_data = search_response.json()
            
        except Exception as e:
            print(f"Exception during Spotify search: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error during Spotify search: {str(e)}")
        
        # Process results
        result_tracks = []
        try:
            # Check if tracks are present in response
            if "tracks" not in search_data or "items" not in search_data["tracks"]:
                print(f"Unexpected Spotify API response format: {search_data.keys()}")
                raise HTTPException(status_code=500, detail="Unexpected Spotify API response format")
            
            for item in search_data["tracks"]["items"]:
                try:
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
                except Exception as e:
                    print(f"Error processing track {item.get('id', 'unknown')}: {str(e)}")
                    # Continue processing other tracks instead of failing the whole request
            
            print(f"Processed {len(result_tracks)} tracks from Spotify search results")
            return SearchResponse(tracks=result_tracks)
            
        except Exception as e:
            print(f"Exception processing search results: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing search results: {str(e)}")
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Log the full exception for server-side debugging
        import traceback
        print(f"Unexpected error in Spotify search: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
