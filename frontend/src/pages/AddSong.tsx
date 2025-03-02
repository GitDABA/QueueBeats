import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { Navigation } from "../components/Navigation";
import { AuthInit } from "../components/AuthInit";
import { AuthProvider } from "../components/AuthProvider";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../utils/auth";
import brain from "../brain";

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
  
  // Validate queue ID
  useEffect(() => {
    if (!queueId) {
      setError("Queue ID is missing. Please return to the queue and try again.");
    }
  }, [queueId]);
  
  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      const response = await brain.search_songs({ query: searchQuery });
      const data = await response.json();
      
      setSearchResults(data.results);
      
      if (data.results.length === 0) {
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
    if (!selectedSong || !queueId || !user) return;
    
    try {
      setIsAdding(true);
      setError(null);
      
      const response = await brain.add_song_to_queue({
        queue_id: queueId,
        song_id: selectedSong.id,
        user_id: user.id
      });
      
      await response.json();
      
      setSuccessMessage(`"${selectedSong.title}" by ${selectedSong.artist} added to the queue!`);
      setSelectedSong(null);
    } catch (err: any) {
      console.error("Error adding song to queue:", err);
      setError("Failed to add song to queue. Please try again.");
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
