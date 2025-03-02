from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import json
import re
import databutton as db

router = APIRouter(prefix="/songs")

# Define models
class SongSearchResult(BaseModel):
    id: str
    title: str
    artist: str
    album: Optional[str] = None
    cover_url: Optional[str] = None
    duration_ms: Optional[int] = None

class SongSearchResponse(BaseModel):
    results: List[SongSearchResult]

class AddSongRequest(BaseModel):
    queue_id: str
    song_id: str
    user_id: str

class SongResponse(BaseModel):
    id: str
    queue_id: str
    title: str
    artist: str
    album: Optional[str] = None
    cover_url: Optional[str] = None
    added_by: str
    created_at: str

# Mock data - popular songs
MOCK_SONGS = [
    {
        "id": "1",
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "album": "After Hours",
        "cover_url": "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 200040
    },
    {
        "id": "2",
        "title": "Dance Monkey",
        "artist": "Tones and I",
        "album": "The Kids Are Coming",
        "cover_url": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 209438
    },
    {
        "id": "3",
        "title": "Shape of You",
        "artist": "Ed Sheeran",
        "album": "÷ (Divide)",
        "cover_url": "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 233712
    },
    {
        "id": "4",
        "title": "Someone You Loved",
        "artist": "Lewis Capaldi",
        "album": "Divinely Uninspired to a Hellish Extent",
        "cover_url": "https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 182161
    },
    {
        "id": "5",
        "title": "Bad Guy",
        "artist": "Billie Eilish",
        "album": "When We All Fall Asleep, Where Do We Go?",
        "cover_url": "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 194088
    },
    {
        "id": "6",
        "title": "Watermelon Sugar",
        "artist": "Harry Styles",
        "album": "Fine Line",
        "cover_url": "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 174000
    },
    {
        "id": "7",
        "title": "Don't Start Now",
        "artist": "Dua Lipa",
        "album": "Future Nostalgia",
        "cover_url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 183290
    },
    {
        "id": "8",
        "title": "Circles",
        "artist": "Post Malone",
        "album": "Hollywood's Bleeding",
        "cover_url": "https://images.unsplash.com/photo-1504898770365-14faca6a7320?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 214740
    },
    {
        "id": "9",
        "title": "Memories",
        "artist": "Maroon 5",
        "album": "Memories",
        "cover_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 189486
    },
    {
        "id": "10",
        "title": "Mood",
        "artist": "24kGoldn ft. iann dior",
        "album": "El Dorado",
        "cover_url": "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 140533
    },
    {
        "id": "11",
        "title": "Savage Love",
        "artist": "Jason Derulo",
        "album": "Savage Love",
        "cover_url": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 171218
    },
    {
        "id": "12",
        "title": "Roxanne",
        "artist": "Arizona Zervas",
        "album": "Roxanne",
        "cover_url": "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 163636
    },
    {
        "id": "13",
        "title": "before you go",
        "artist": "Lewis Capaldi",
        "album": "Divinely Uninspired to a Hellish Extent",
        "cover_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 215107
    },
    {
        "id": "14",
        "title": "Dynamite",
        "artist": "BTS",
        "album": "Dynamite (DayTime Version)",
        "cover_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 199054
    },
    {
        "id": "15",
        "title": "Everything I Wanted",
        "artist": "Billie Eilish",
        "album": "Everything I Wanted",
        "cover_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 245426
    },
    {
        "id": "16",
        "title": "Adore You",
        "artist": "Harry Styles",
        "album": "Fine Line",
        "cover_url": "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 207133
    },
    {
        "id": "17",
        "title": "Rain On Me",
        "artist": "Lady Gaga & Ariana Grande",
        "album": "Chromatica",
        "cover_url": "https://images.unsplash.com/photo-1515696955266-4f67e13219e8?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 182200
    },
    {
        "id": "18",
        "title": "Say So",
        "artist": "Doja Cat",
        "album": "Hot Pink",
        "cover_url": "https://images.unsplash.com/photo-1504609813442-a9c286d4b4e0?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 237893
    },
    {
        "id": "19",
        "title": "Death Bed",
        "artist": "Powfu ft. beabadoobee",
        "album": "Death Bed",
        "cover_url": "https://images.unsplash.com/photo-1455679103965-0b70a5d7fef2?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 173333
    },
    {
        "id": "20",
        "title": "Kings & Queens",
        "artist": "Ava Max",
        "album": "Heaven & Hell",
        "cover_url": "https://images.unsplash.com/photo-1517230878791-4d28214057c2?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 162601
    },
    {
        "id": "21",
        "title": "Shallow",
        "artist": "Lady Gaga & Bradley Cooper",
        "album": "A Star Is Born Soundtrack",
        "cover_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 215773
    },
    {
        "id": "22",
        "title": "Believer",
        "artist": "Imagine Dragons",
        "album": "Evolve",
        "cover_url": "https://images.unsplash.com/photo-1537726235470-8504e3beef77?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 204346
    },
    {
        "id": "23",
        "title": "Thunder",
        "artist": "Imagine Dragons",
        "album": "Evolve",
        "cover_url": "https://images.unsplash.com/photo-1553531384-411a247cce93?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 187146
    },
    {
        "id": "24",
        "title": "Señorita",
        "artist": "Shawn Mendes & Camila Cabello",
        "album": "Señorita",
        "cover_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 190800
    },
    {
        "id": "25",
        "title": "Dance Monkey",
        "artist": "Tones and I",
        "album": "The Kids Are Coming",
        "cover_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200&h=200",
        "duration_ms": 209438
    }
]

# Define a function to sanitize storage keys
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

@router.get("/search", response_model=SongSearchResponse)
def search_songs(query: str = Query(..., min_length=1)):
    """Search for songs by title or artist"""
    query = query.lower()
    results = []
    
    for song in MOCK_SONGS:
        if query in song["title"].lower() or query in song["artist"].lower():
            results.append(SongSearchResult(**song))
    
    return SongSearchResponse(results=results)

@router.post("/add", response_model=SongResponse)
def add_song_to_queue(request: AddSongRequest):
    """Add a song to a queue"""
    try:
        # Find the song in our mock database
        song = None
        for s in MOCK_SONGS:
            if s["id"] == request.song_id:
                song = s
                break
        
        if not song:
            raise HTTPException(status_code=404, detail="Song not found")
        
        # Get Supabase connection info
        from app.apis.supabase_config import get_supabase_config
        config = get_supabase_config()
        
        # Create data for inserting
        song_data = {
            "queue_id": request.queue_id,
            "added_by": request.user_id,
            "title": song["title"],
            "artist": song["artist"],
            "album": song.get("album"),
            "cover_url": song.get("cover_url"),
            "duration": song.get("duration_ms"),
            "created_at": "2024-01-01T00:00:00", # This will be overridden by Supabase's now()
            "played": False
        }
        
        # Store the request and result for debugging
        storage_key = sanitize_storage_key(f"song_add_{request.queue_id}_{request.song_id}")
        db.storage.json.put(storage_key, {
            "request": request.dict(),
            "song_data": song_data,
            "config": {
                "url": config.supabase_url
            }
        })
        
        # In a real implementation, we would insert this into Supabase
        # For now, we'll just return a mock response
        response = {
            "id": f"{request.queue_id}_{request.song_id}",
            "queue_id": request.queue_id,
            "title": song["title"],
            "artist": song["artist"],
            "album": song.get("album"),
            "cover_url": song.get("cover_url"),
            "added_by": request.user_id,
            "created_at": "2024-01-01T00:00:00"
        }
        
        return SongResponse(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
