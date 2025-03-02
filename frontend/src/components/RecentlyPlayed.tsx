import React, { useEffect, useState } from "react";
import { getRecentlyPlayedSongs, type Song } from "../utils/queueHelpers";

interface Props {
  queueId: string;
  limit?: number;
}

export function RecentlyPlayed({ queueId, limit = 5 }: Props) {
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRecentSongs = async () => {
      try {
        setLoading(true);
        const songs = await getRecentlyPlayedSongs(queueId, limit);
        setRecentSongs(songs);
      } catch (error) {
        console.error("Error fetching recent songs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentSongs();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentSongs, 30000);
    return () => clearInterval(interval);
  }, [queueId, limit]);
  
  if (loading) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded"></div>
            <div className="flex-1">
              <div className="h-3 w-28 bg-white/10 rounded mb-2"></div>
              <div className="h-2 w-20 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (recentSongs.length === 0) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recently Played</h2>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            No songs have been played yet.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Recently Played</h2>
      
      <div className="space-y-3">
        {recentSongs.map((song) => (
          <div key={song.id} className="flex items-center gap-3 hover:bg-white/5 p-2 rounded transition-colors">
            {song.cover_url ? (
              <img 
                src={song.cover_url} 
                alt={`${song.title} cover`} 
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-black/50 rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{song.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            </div>
            
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {song.played_at && (
                formatTimePlayed(new Date(song.played_at))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to format time in a more readable way
function formatTimePlayed(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hr ago';
  if (diffHours < 24) return `${diffHours} hrs ago`;
  
  return date.toLocaleDateString();
}
