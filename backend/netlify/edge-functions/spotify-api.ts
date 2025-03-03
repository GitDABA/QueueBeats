import { Context } from 'https://edge.netlify.com';

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_API = 'https://accounts.spotify.com/api';

// Cache TTL (in seconds)
const CACHE_TTL = {
  search: 3600, // 1 hour for search results
  tracks: 86400, // 24 hours for track details
  default: 300, // 5 minutes default
};

export default async (request: Request, context: Context) => {
  // Get path and query parameters
  const url = new URL(request.url);
  const path = url.pathname.replace('/spotify/', '');
  const searchParams = url.searchParams;
  
  // Set up response headers with CORS support
  const responseInit = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Update for production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  };
  
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, responseInit);
  }
  
  try {
    // Handle different Spotify API endpoints
    if (path.startsWith('search')) {
      return handleSpotifySearch(request, context, searchParams, responseInit);
    } else if (path.startsWith('tracks')) {
      return handleSpotifyTracks(request, context, path, responseInit);
    } else if (path.startsWith('token') || path.startsWith('refresh')) {
      return handleTokenRequests(request, context, path, responseInit);
    } else {
      // General proxy for other Spotify API requests
      return handleGenericSpotifyRequest(request, context, path, responseInit);
    }
  } catch (error) {
    console.error('Error in Spotify Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        ...responseInit,
        status: 500,
      }
    );
  }
};

/**
 * Handle Spotify search requests
 */
async function handleSpotifySearch(
  request: Request,
  context: Context,
  searchParams: URLSearchParams, 
  responseInit: any
) {
  // Get search parameters
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '10';
  const type = searchParams.get('type') || 'track';
  
  if (!query) {
    return new Response(
      JSON.stringify({ error: 'Query parameter is required' }),
      { ...responseInit, status: 400 }
    );
  }
  
  // Get access token from request headers
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Authorization token is required' }),
      { ...responseInit, status: 401 }
    );
  }
  
  // Create Spotify API URL
  const spotifyUrl = new URL(`${SPOTIFY_API_BASE}/search`);
  spotifyUrl.searchParams.append('q', query);
  spotifyUrl.searchParams.append('type', type);
  spotifyUrl.searchParams.append('limit', limit);
  
  // Set request options with token
  const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  try {
    // Use Netlify's built-in cache
    const cacheKey = `spotify-search-${query}-${type}-${limit}`;
    let data;
    
    // Try to get from cache first
    const cachedResponse = await context.cache.get(cacheKey);
    if (cachedResponse) {
      data = cachedResponse;
    } else {
      // Make request to Spotify API
      const response = await fetch(spotifyUrl.toString(), requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify API error (${response.status}): ${errorText}`);
      }
      
      data = await response.json();
      
      // Cache the result
      await context.cache.set(cacheKey, data, { ttl: CACHE_TTL.search });
    }
    
    return new Response(
      JSON.stringify(data),
      responseInit
    );
  } catch (error) {
    console.error('Spotify search error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Spotify API Error',
        message: error instanceof Error ? error.message : 'Failed to search Spotify',
      }),
      { ...responseInit, status: 502 }
    );
  }
}

/**
 * Handle Spotify track requests
 */
async function handleSpotifyTracks(
  request: Request,
  context: Context,
  path: string,
  responseInit: any
) {
  // Get track ID from path
  const trackId = path.replace('tracks/', '');
  
  if (!trackId) {
    return new Response(
      JSON.stringify({ error: 'Track ID is required' }),
      { ...responseInit, status: 400 }
    );
  }
  
  // Get access token from request headers
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Authorization token is required' }),
      { ...responseInit, status: 401 }
    );
  }
  
  // Set request options with token
  const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  try {
    // Use Netlify's built-in cache
    const cacheKey = `spotify-track-${trackId}`;
    let data;
    
    // Try to get from cache first
    const cachedResponse = await context.cache.get(cacheKey);
    if (cachedResponse) {
      data = cachedResponse;
    } else {
      // Make request to Spotify API
      const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify API error (${response.status}): ${errorText}`);
      }
      
      data = await response.json();
      
      // Cache the result
      await context.cache.set(cacheKey, data, { ttl: CACHE_TTL.tracks });
    }
    
    return new Response(
      JSON.stringify(data),
      responseInit
    );
  } catch (error) {
    console.error('Spotify track error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Spotify API Error',
        message: error instanceof Error ? error.message : 'Failed to get track from Spotify',
      }),
      { ...responseInit, status: 502 }
    );
  }
}

/**
 * Handle token-related requests (token exchange and refresh)
 */
async function handleTokenRequests(
  request: Request,
  context: Context,
  path: string,
  responseInit: any
) {
  // Only accept POST requests for token operations
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { ...responseInit, status: 405 }
    );
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Get client credentials from environment variables
    const clientId = context.env.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = context.env.SPOTIFY_CLIENT_SECRET || process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Spotify client credentials not configured');
    }
    
    // Set up request headers for Spotify token API
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    };
    
    let requestBody;
    let endpoint = `${SPOTIFY_ACCOUNTS_API}/token`;
    
    // Handle token exchange or refresh
    if (path.includes('token') && body.code) {
      // Handle authorization code exchange
      const redirectUri = body.redirect_uri || `${new URL(request.url).origin}/callback`;
      
      requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: body.code,
        redirect_uri: redirectUri,
      }).toString();
    } else if (path.includes('refresh') && body.refresh_token) {
      // Handle token refresh
      requestBody = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: body.refresh_token,
      }).toString();
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { ...responseInit, status: 400 }
      );
    }
    
    // Make request to Spotify API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: requestBody,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify token API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      responseInit
    );
  } catch (error) {
    console.error('Spotify token request error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Spotify Token Error',
        message: error instanceof Error ? error.message : 'Failed to process token request',
      }),
      { ...responseInit, status: 502 }
    );
  }
}

/**
 * Handle generic Spotify API requests
 */
async function handleGenericSpotifyRequest(
  request: Request,
  context: Context,
  path: string,
  responseInit: any
) {
  // Get access token from request headers
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Authorization token is required' }),
      { ...responseInit, status: 401 }
    );
  }
  
  // Create Spotify API URL
  const spotifyUrl = new URL(`${SPOTIFY_API_BASE}/${path}`);
  
  // Add query parameters
  const url = new URL(request.url);
  url.searchParams.forEach((value, key) => {
    spotifyUrl.searchParams.append(key, value);
  });
  
  // Set request options with token
  const requestOptions = {
    method: request.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  // Add body for non-GET requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const body = await request.json();
      requestOptions.body = JSON.stringify(body);
    } catch (error) {
      // Request might not have a body, that's okay
    }
  }
  
  try {
    // Make request to Spotify API
    const response = await fetch(spotifyUrl.toString(), requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Cache if it's a GET request
    if (request.method === 'GET') {
      const cacheKey = `spotify-${path}-${url.search}`;
      await context.cache.set(cacheKey, data, { ttl: CACHE_TTL.default });
    }
    
    return new Response(
      JSON.stringify(data),
      responseInit
    );
  } catch (error) {
    console.error('Spotify API request error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Spotify API Error',
        message: error instanceof Error ? error.message : 'Failed to process Spotify API request',
      }),
      { ...responseInit, status: 502 }
    );
  }
}
