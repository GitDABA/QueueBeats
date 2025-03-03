import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { Navigation } from "../components/Navigation";
import { AuthInit } from "../components/AuthInit";
import { AuthProvider } from "../components/AuthProvider";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../utils/auth";
import apiBrain from "../utils/api";

export default function AddSong() {
  return (
    <AuthInit>
      <AuthProvider>
        <ProtectedRoute>
          <AddSongContent />
        </ProtectedRoute>
      </AuthProvider>
    </AuthInit>
  );
}

type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover_url?: string;
  duration_ms?: number;
};

function AddSongContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract the queue ID from query params
  const queryParams = new URLSearchParams(location.search);
  const queueId = queryParams.get("queueId");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [queueIdError, setQueueIdError] = useState<string | null>(null);
  
  // Validate queue ID format (required to be UUID)
  const validateQueueId = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };
  
  // Handler for queue ID input changes
  const handleQueueIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    queryParams.set("queueId", value);
    const newUrl = `${location.pathname}?${queryParams.toString()}`;
    navigate(newUrl, { replace: true });
    
    // Clear error if empty (will be caught by required field validation)
    if (!value) {
      setQueueIdError(null);
      return;
    }
    
    // Validate UUID format
    if (!validateQueueId(value)) {
      setQueueIdError('Queue ID must be a valid UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
    } else {
      setQueueIdError(null);
    }
  };
  
  // Generate a random UUID for testing
  const generateUUID = (): string => {
    // Simple implementation to generate UUIDs
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Set a random UUID for testing
  const handleGenerateUUID = () => {
    const newUUID = generateUUID();
    queryParams.set("queueId", newUUID);
    const newUrl = `${location.pathname}?${queryParams.toString()}`;
    navigate(newUrl, { replace: true });
    setQueueIdError(null);
  };
  
  // Validate queue ID
  useEffect(() => {
    // Extract queue ID from URL
    const id = queryParams.get('queueId') || '';
    
    if (!id) {
      setError("Queue ID is missing. Please return to the queue and try again.");
    } else if (!validateQueueId(id)) {
      setError('Queue ID must be a valid UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
      setQueueIdError('Queue ID must be a valid UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
    } else {
      setError(null);
      setQueueIdError(null);
    }
  }, [queryParams]);
  
  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      console.log(`Searching for tracks with query: ${searchQuery}`);
      const response = await apiBrain.search_spotify_tracks(searchQuery);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Search failed:', errorData);
        setError(errorData.message || 'Failed to search for tracks. Please try again.');
        setSearchResults([]);
        return;
      }
      
      const data = await response.json();
      
      if (!data.tracks || !Array.isArray(data.tracks)) {
        console.error('Invalid response format:', data);
        setError('Received invalid search results format. Please try again.');
        setSearchResults([]);
        return;
      }
      
      // Map the tracks to the expected Song interface format
      const results = data.tracks.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: Array.isArray(track.artists) 
          ? track.artists.join(', ') 
          : (typeof track.artists === 'string' ? track.artists : 'Unknown Artist'),
        album: track.album || 'Unknown Album',
        cover_url: track.album_art || '',
        duration_ms: track.duration_ms || 0
      }));
      
      console.log(`Found ${results.length} search results`);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError("No songs found. Try a different search term.");
      }
    } catch (err: any) {
      console.error("Error searching songs:", err);
      setError("Failed to search songs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle song selection
  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setSuccessMessage(null);
  };
  
  // Handle add song to queue
  const handleAddToQueue = async () => {
    console.log(`Adding song to queue. Song ID: ${selectedSong?.id}, Queue ID: ${queueId}`);
    setIsAdding(true);
    setError(null);
    
    try {
      if (!selectedSong) {
        throw new Error('No song selected');
      }
      
      if (!queueId) {
        throw new Error('Queue ID is required');
      }
      
      // Validate queue ID format
      if (!validateQueueId(queueId)) {
        setQueueIdError('Queue ID must be a valid UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
        throw new Error('Invalid queue ID format');
      }
      
      const userId = user?.id;
      if (!userId) {
        throw new Error('User ID is missing. Please sign in again.');
      }
      
      console.log(`API information - Base URL: ${import.meta.env.VITE_API_URL}, Use Netlify Functions: ${import.meta.env.VITE_USE_NETLIFY_FUNCTIONS}`);
      
      // Log configuration information for debugging
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      console.log(`Using API URL: ${apiUrl} for add song request`);
      
      // Create a copy of the song object with only the properties we need
      // IMPORTANT: For testing with mock backend data, use simple numeric IDs
      const songToAdd = {
        id: "1", // Use a simple ID that matches one of the mock songs
        title: selectedSong?.title,
        artist: selectedSong?.artist,
        album: selectedSong?.album,
        duration_ms: selectedSong?.duration_ms,
        cover_url: selectedSong?.cover_url,
        spotify_uri: selectedSong?.id
      };
      
      console.log(`Song data for API: ${JSON.stringify(songToAdd)}`);
      console.log(`Queue ID for API: ${queueId}`);
      console.log(`User ID for API: ${userId}`);
      
      // Use the brain.ts function to add the song to the queue
      const response = await apiBrain.add_song_to_queue({
        queue_id: queueId,
        song: songToAdd, // Pass the full song object with ID that matches mock data
        user_id: user?.id
      });
      
      if (!response.ok) {
        console.error('Error response from add_song_to_queue:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        let errorDetails = '';
        try {
          // Get a copy of the response body as text
          const errorText = await response.text();
          try {
            // Try to parse it as JSON if possible
            const errorJson = JSON.parse(errorText);
            errorDetails = JSON.stringify(errorJson);
          } catch (jsonError) {
            // If not valid JSON, use the raw text
            errorDetails = errorText;
          }
          console.error('Error details:', errorDetails);
        } catch (readError) {
          console.error('Could not read error details:', readError);
          errorDetails = 'Could not read error details';
        }
        
        throw new Error(`Failed to add song: ${response.status} ${response.statusText}`);
      }
      
      // If we get here, the song was added successfully
      console.log('Song added to queue successfully!');
      
      // Try to get response data if available
      let responseData = null;
      try {
        const responseText = await response.text();
        try {
          responseData = JSON.parse(responseText);
          console.log('Add song response data:', responseData);
        } catch (jsonError) {
          console.log('Response is not valid JSON:', responseText);
        }
      } catch (textError) {
        console.log('Could not read response text:', textError);
      }
      
      setSuccessMessage(`"${selectedSong?.title}" by ${selectedSong?.artist} added to the queue!`);
      setSelectedSong(null);
    } catch (error) {
      console.error('Error adding song to queue:', error);
      
      let errorMessage = 'Failed to add song to queue';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };
  
  // Format duration from milliseconds to mm:ss
  const formatDuration = (ms?: number) => {
    if (!ms) return "";
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };
  
  if (!queueId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-500/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="text-muted-foreground mb-6">
                Queue ID is missing. Please return to the queue and try again.
              </p>
              <Button
                variant="default"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">Add Song to Queue</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/queue/${queueId}`)}
            >
              Back to Queue
            </Button>
          </div>
          
          {error && (
            <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="p-4 mb-6 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
              {successMessage}
            </div>
          )}
          
          {/* Queue ID input */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <div className="form-field">
              <label htmlFor="queueId">Queue ID (UUID format required)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="queueId"
                  value={queueId}
                  onChange={handleQueueIdChange}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="flex-grow"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateUUID}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  title="Generate random UUID for testing"
                >
                  Generate
                </button>
              </div>
              {queueIdError && <p className="error-message">{queueIdError}</p>}
            </div>
          </div>
          
          {/* Search form */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for songs or artists..."
                className="flex-1 px-4 py-2 bg-black/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSearching}
              />
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                variant="glow"
              >
                {isSearching ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : "Search"}
              </Button>
            </form>
          </div>
          
          {/* Selected song */}
          {selectedSong && (
            <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Selected Song</h2>
              
              <div className="flex items-center gap-4">
                {selectedSong.cover_url ? (
                  <img
                    src={selectedSong.cover_url}
                    alt={`${selectedSong.title} cover`}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-black/50 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
                
                <div>
                  <h3 className="font-bold text-lg">{selectedSong.title}</h3>
                  <p className="text-muted-foreground">{selectedSong.artist}</p>
                  {selectedSong.album && (
                    <p className="text-sm text-muted-foreground">Album: {selectedSong.album}</p>
                  )}
                </div>
                
                <div className="ml-auto">
                  <Button
                    variant="default"
                    onClick={handleAddToQueue}
                    disabled={isAdding}
                  >
                    {isAdding ? "Adding..." : "Add to Queue"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold">Search Results</h2>
              </div>
              
              <div className="divide-y divide-white/10">
                {searchResults.map((song) => (
                  <div 
                    key={song.id} 
                    className={`p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors ${selectedSong?.id === song.id ? 'bg-purple-500/10 hover:bg-purple-500/20' : ''}`}
                    onClick={() => handleSelectSong(song)}
                  >
                    {song.cover_url ? (
                      <img
                        src={song.cover_url}
                        alt={`${song.title} cover`}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-black/50 rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{song.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    
                    {song.duration_ms && (
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(song.duration_ms)}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSong(song);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
