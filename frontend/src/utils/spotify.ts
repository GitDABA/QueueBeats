// Spotify API integration utility functions
import { supabase } from './supabase';
import brain from '../brain';

// Constants
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// This should match the redirect URI registered in the Spotify Developer Dashboard
export const REDIRECT_URI = `${window.location.origin}/spotify-callback`;

// These scopes allow for playback control and reading user library
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
];

// Utility function to encode query parameters
export const encodeQueryParams = (params: Record<string, string>) => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

// Get Spotify configuration from backend
export const getSpotifyConfig = async () => {
  try {
    const response = await brain.get_spotify_config();
    return await response.json();
  } catch (error) {
    console.error('Error getting Spotify config:', error);
    throw error;
  }
};

// Generate the authorization URL for Spotify login
export const getAuthUrl = async () => {
  try {
    const config = await getSpotifyConfig();
    
    const params = {
      client_id: config.client_id,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(' '),
      show_dialog: 'true' // Force the user to approve the app again
    };

    return `${SPOTIFY_AUTH_ENDPOINT}?${encodeQueryParams(params)}`;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
};

// Exchange authorization code for access token
export const getAccessToken = async (code: string) => {
  try {
    const response = await brain.exchange_code_for_token({
      code,
      redirect_uri: REDIRECT_URI
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

// Store Spotify tokens in Supabase user metadata
export const storeSpotifyTokens = async (userId: string, tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) => {
  try {
    // Calculate when the token will expire
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        spotify_access_token: tokens.access_token,
        spotify_refresh_token: tokens.refresh_token,
        spotify_token_expires_at: new Date(expiresAt).toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error storing Spotify tokens:', error);
    throw error;
  }
};

// Get stored Spotify tokens from Supabase
export const getStoredSpotifyTokens = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('spotify_access_token, spotify_refresh_token, spotify_token_expires_at')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    // Check if the token is expired
    const expiresAt = new Date(data.spotify_token_expires_at).getTime();
    const isExpired = Date.now() > expiresAt;
    
    return {
      accessToken: data.spotify_access_token,
      refreshToken: data.spotify_refresh_token,
      isExpired
    };
  } catch (error) {
    console.error('Error getting Spotify tokens:', error);
    return null;
  }
};

// Refresh expired Spotify access token
export const refreshSpotifyToken = async (refreshToken: string) => {
  try {
    const response = await brain.refresh_token({
      refresh_token: refreshToken
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    throw error;
  }
};

// Get a valid Spotify access token (refreshes if necessary)
export const getValidSpotifyToken = async (userId: string) => {
  try {
    const tokens = await getStoredSpotifyTokens(userId);
    
    if (!tokens) {
      return null;
    }
    
    if (tokens.isExpired) {
      // Token is expired, refresh it
      const newTokens = await refreshSpotifyToken(tokens.refreshToken);
      
      // Store the new tokens
      await storeSpotifyTokens(userId, newTokens);
      
      return newTokens.access_token;
    }
    
    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting valid Spotify token:', error);
    return null;
  }
};

// Check if the user is connected to Spotify
export const isConnectedToSpotify = async (userId: string) => {
  const tokens = await getStoredSpotifyTokens(userId);
  return !!tokens;
};

// Get currently playing track from Spotify API
export const getCurrentTrack = async (accessToken: string) => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 204) {
      // No track currently playing
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to get current track: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting current track:', error);
    return null;
  }
};

// Play a track using Spotify API
export const playTrack = async (accessToken: string, uri: string, deviceId?: string) => {
  try {
    let endpoint = `${SPOTIFY_API_BASE}/me/player/play`;
    if (deviceId) {
      endpoint += `?device_id=${deviceId}`;
    }
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [uri]
      })
    });
    
    if (!response.ok && response.status !== 204) {
      const errorDetails = await response.json().catch(() => ({}));
      console.error('Play track error details:', errorDetails);
      throw new Error(`Failed to play track: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error playing track:', error);
    return false;
  }
};

// Pause playback using Spotify API
export const pausePlayback = async (accessToken: string, deviceId?: string) => {
  try {
    let endpoint = `${SPOTIFY_API_BASE}/me/player/pause`;
    if (deviceId) {
      endpoint += `?device_id=${deviceId}`;
    }
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to pause playback: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error pausing playback:', error);
    return false;
  }
};

// Skip to next track using Spotify API
export const skipToNext = async (accessToken: string, deviceId?: string) => {
  try {
    let endpoint = `${SPOTIFY_API_BASE}/me/player/next`;
    if (deviceId) {
      endpoint += `?device_id=${deviceId}`;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to skip to next track: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error skipping to next track:', error);
    return false;
  }
};

// Skip to previous track using Spotify API
export const skipToPrevious = async (accessToken: string, deviceId?: string) => {
  try {
    let endpoint = `${SPOTIFY_API_BASE}/me/player/previous`;
    if (deviceId) {
      endpoint += `?device_id=${deviceId}`;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to skip to previous track: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error skipping to previous track:', error);
    return false;
  }
};

// Get available devices using Spotify API
export const getAvailableDevices = async (accessToken: string) => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/devices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get available devices: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.devices;
  } catch (error) {
    console.error('Error getting available devices:', error);
    return [];
  }
};

// Transfer playback to a specific device
export const transferPlayback = async (accessToken: string, deviceId: string) => {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: true
      })
    });
    
    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to transfer playback: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error transferring playback:', error);
    return false;
  }
};

// Search for a track on Spotify
export const searchTracks = async (accessToken: string, query: string) => {
  try {
    const params = encodeQueryParams({
      q: query,
      type: 'track',
      limit: '10'
    });
    
    const response = await fetch(`${SPOTIFY_API_BASE}/search?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search for track: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error('Error searching for track:', error);
    return [];
  }
};

// Spotify Web Playback SDK initialization
let spotifyPlayer: any = null;
let deviceId: string | null = null;

// Initialize Spotify Web Playback SDK
export const initializePlayer = (token: string) => {
  return new Promise<string>((resolve, reject) => {
    // Check if Spotify is already loaded
    if (window.Spotify) {
      createPlayer(token, resolve, reject);
      return;
    }
    
    // Load Spotify Player script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    
    script.onload = () => {
      // Wait for Spotify to be ready
      window.onSpotifyWebPlaybackSDKReady = () => {
        createPlayer(token, resolve, reject);
      };
    };
    
    script.onerror = (error) => {
      reject('Failed to load Spotify Web Playback SDK');
    };
    
    document.body.appendChild(script);
  });
};

// Create the Spotify player instance
const createPlayer = (token: string, resolve: (deviceId: string) => void, reject: (reason: any) => void) => {
  spotifyPlayer = new window.Spotify.Player({
    name: 'QueueBeats Player',
    getOAuthToken: (cb: (token: string) => void) => { cb(token); },
    volume: 0.5
  });
  
  // Error handling
  spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
    console.error('Initialization error:', message);
    reject(message);
  });
  
  spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
    console.error('Authentication error:', message);
    reject(message);
  });
  
  spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
    console.error('Account error:', message);
    reject(message);
  });
  
  spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
    console.error('Playback error:', message);
  });
  
  // Ready event
  spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
    console.log('Ready with Device ID', device_id);
    deviceId = device_id;
    resolve(device_id);
  });
  
  // Not ready event
  spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
    console.log('Device ID has gone offline', device_id);
    deviceId = null;
  });
  
  // Connect to the player
  spotifyPlayer.connect();
};

// Get the current device ID
export const getPlayerDeviceId = () => deviceId;

// Disconnect the player
export const disconnectPlayer = () => {
  if (spotifyPlayer) {
    spotifyPlayer.disconnect();
    spotifyPlayer = null;
    deviceId = null;
  }
};

// Check if the player is connected
export const isPlayerConnected = () => {
  return !!spotifyPlayer && !!deviceId;
};

// Toggle play/pause
export const togglePlayback = async (accessToken: string) => {
  if (!spotifyPlayer) return false;
  
  return await spotifyPlayer.togglePlay();
};

// Play a specific track via the SDK player
export const playTrackOnPlayer = async (accessToken: string, uri: string) => {
  if (!deviceId) return false;
  
  return await playTrack(accessToken, uri, deviceId);
};

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}
