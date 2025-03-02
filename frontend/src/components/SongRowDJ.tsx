import React, { useState } from "react";
import { Button } from "./Button";
import { removeSongFromQueue } from "../utils/queueHelpers";
import { toast } from "sonner";
import type { Song } from "../components/SongRow";

interface Props {
  song: Song;
  index: number;
  userId: string;
  onPlayNow: (songId: string) => void;
  onRemove: (songId: string) => void;
  onMoveUp?: (songId: string) => void;
  onMoveDown?: (songId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  refreshSongs: () => void;
}

export function SongRowDJ({ 
  song, 
  index, 
  userId,
  onPlayNow, 
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  refreshSongs 
}: Props) {
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove "${song.title}" from the queue?`)) {
      try {
        setIsRemoving(true);
        await removeSongFromQueue(song.id);
        onRemove(song.id);
        toast.success("Song removed from queue");
        refreshSongs();
      } catch (err) {
        console.error("Error removing song:", err);
        toast.error("Failed to remove song");
      } finally {
        setIsRemoving(false);
      }
    }
  };
  
  return (
    <div className="p-3 hover:bg-white/5 flex items-center gap-3 transition-colors group">
      <div className="flex items-center justify-center w-8 h-8">
        <span className="text-lg font-medium">#{index + 1}</span>
      </div>
      
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {/* Album cover */}
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={`${song.title} cover`}
            className="w-12 h-12 object-cover rounded-md"
          />
        ) : (
          <div className="w-12 h-12 bg-black/50 rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        
        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{song.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        </div>
      </div>
      
      {/* Vote count */}
      <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 flex items-center gap-1 mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        {song.total_votes || 0}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Reorder buttons */}
        {onMoveUp && onMoveDown && (
          <div className="flex items-center">
            <button
              className={`p-1 rounded hover:bg-white/10 ${isFirst ? 'text-gray-600 cursor-not-allowed' : 'text-white'}`}
              onClick={() => !isFirst && onMoveUp(song.id)}
              disabled={isFirst}
              aria-label="Move up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              className={`p-1 rounded hover:bg-white/10 ${isLast ? 'text-gray-600 cursor-not-allowed' : 'text-white'}`}
              onClick={() => !isLast && onMoveDown(song.id)}
              disabled={isLast}
              aria-label="Move down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Play Now button */}
        <Button
          variant="default"
          size="sm"
          onClick={() => onPlayNow(song.id)}
        >
          Play Now
        </Button>
        
        {/* Remove button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isRemoving ? (
            <span className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          ) : (
            <span>Remove</span>
          )}
        </Button>
      </div>
    </div>
  );
}
