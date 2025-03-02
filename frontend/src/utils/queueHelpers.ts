import { supabase } from './supabase';
import type { Database } from './database.types';

export type Queue = Database['public']['Tables']['queues']['Row'];
export type Song = Database['public']['Tables']['songs']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];

export type QueueSettings = {
  isPublic: boolean;
  allowGuestAddSongs: boolean;
  maxVotesPerUser?: number;
  requireApproval?: boolean;
};

// Remove a song from the queue
export const removeSongFromQueue = async (songId: string) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Song;
  } catch (error) {
    console.error('Error removing song from queue:', error);
    throw error;
  }
};

// Update song position in queue
export const updateSongPosition = async (songId: string, position: number) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .update({ position })
      .eq('id', songId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Song;
  } catch (error) {
    console.error('Error updating song position:', error);
    throw error;
  }
};

// Get recently played songs
export const getRecentlyPlayedSongs = async (queueId: string, limit: number = 5) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('queue_id', queueId)
      .eq('played', true)
      .order('played_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Song[];
  } catch (error) {
    console.error('Error fetching recently played songs:', error);
    throw error;
  }
};

// Get current playing song (most recently marked as played)
export const getCurrentPlayingSong = async (queueId: string) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('queue_id', queueId)
      .eq('played', true)
      .order('played_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code === 'PGRST116') { // No rows found
      return null;
    }
    
    if (error) throw error;
    return data as Song;
  } catch (error) {
    console.error('Error fetching currently playing song:', error);
    return null;
  }
};

// Create a new queue
export const createQueue = async (
  userId: string, 
  name: string, 
  description?: string, 
  settings?: QueueSettings
) => {
  try {
    // Generate a random 6-digit access code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { data, error } = await supabase
      .from('queues')
      .insert({
        name,
        description,
        creator_id: userId,
        active: true,
        access_code: accessCode,
        settings: settings || { isPublic: true, allowGuestAddSongs: true },
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Queue;
  } catch (error) {
    console.error('Error creating queue:', error);
    throw error;
  }
};

// Get all queues for a user
export const getUserQueues = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Queue[];
  } catch (error) {
    console.error('Error fetching user queues:', error);
    throw error;
  }
};

// Get a queue by ID
export const getQueueById = async (queueId: string) => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('id', queueId)
      .single();
    
    if (error) throw error;
    return data as Queue;
  } catch (error) {
    console.error('Error fetching queue:', error);
    throw error;
  }
};

// Check if a user has voted for a song
export const hasUserVotedForSong = async (songId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('song_id', songId)
      .eq('profile_id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') { // No rows found
      return false;
    }
    
    if (error) throw error;
    return !!data; // Returns true if vote exists
  } catch (error) {
    console.error('Error checking if user voted for song:', error);
    return false; // Default to false on error
  }
};

// Get a queue by access code
export const getQueueByAccessCode = async (accessCode: string) => {
  try {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('access_code', accessCode)
      .eq('active', true)
      .single();
    
    if (error) throw error;
    return data as Queue;
  } catch (error) {
    console.error('Error fetching queue by access code:', error);
    throw error;
  }
};

// Add a song to a queue
export const addSongToQueue = async (queueId: string, userId: string, songData: {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  track_uri?: string;
  cover_url?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .insert({
        queue_id: queueId,
        added_by: userId,
        title: songData.title,
        artist: songData.artist,
        album: songData.album || null,
        duration: songData.duration || null,
        track_uri: songData.track_uri || null,
        cover_url: songData.cover_url || null,
        played: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Song;
  } catch (error) {
    console.error('Error adding song to queue:', error);
    throw error;
  }
};

// Vote for a song
export const voteForSong = async (songId: string, userId: string, voteCount: number = 1) => {
  console.log('Voting for song:', { songId, userId, voteCount });
  try {
    // Check if user has already voted for this song
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('song_id', songId)
      .eq('profile_id', userId)
      .single();
      
    console.log('Existing vote check:', { existingVote, checkError });
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error code
      throw checkError;
    }
    
    // If user has already voted, update the vote count
    if (existingVote) {
      const { data, error } = await supabase
        .from('votes')
        .update({ vote_count: voteCount })
        .eq('id', existingVote.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Vote;
    }
    
    // Otherwise, create a new vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        song_id: songId,
        profile_id: userId,
        vote_count: voteCount,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Vote;
  } catch (error) {
    console.error('Error voting for song:', error);
    throw error;
  }
};

// Get songs in a queue with their vote counts
export const getQueueSongs = async (queueId: string, userId?: string) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        votes:votes(vote_count, profile_id)
      `)
      .eq('queue_id', queueId)
      .eq('played', false)
      .order('created_at');
    
    if (error) throw error;
    
    // Process the data to calculate total votes and check if user has voted
    const songsWithVotes = data.map(song => {
      const totalVotes = song.votes?.reduce((sum: number, vote: any) => sum + vote.vote_count, 0) || 0;
      
      // Check if the current user has voted for this song
      const userHasVoted = userId ? 
        song.votes?.some((vote: any) => vote.profile_id === userId) : 
        false;
      
      return {
        ...song,
        total_votes: totalVotes,
        user_has_voted: userHasVoted
      };
    });
    
    // Sort by total votes (descending)
    songsWithVotes.sort((a, b) => b.total_votes - a.total_votes);
    
    return songsWithVotes;
  } catch (error) {
    console.error('Error fetching queue songs:', error);
    throw error;
  }
};

// Mark a song as played
export const markSongAsPlayed = async (songId: string) => {
  try {
    const { data, error } = await supabase
      .from('songs')
      .update({
        played: true,
        played_at: new Date().toISOString()
      })
      .eq('id', songId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Song;
  } catch (error) {
    console.error('Error marking song as played:', error);
    throw error;
  }
};
