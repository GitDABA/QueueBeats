// Netlify Serverless Function for Spotify Search
const { loadEnv } = require('./utils/load-env'); // Load environment variables from appropriate .env file
loadEnv();

const { createClient } = require('@supabase/supabase-js');
const { headers } = require('./utils/cors-headers');
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Parse query parameters
  const params = new URLSearchParams(event.queryStringParameters);
  const query = params.get('query');
  const limit = params.get('limit') || 10;

  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing query parameter' })
    };
  }

  // Get Spotify client ID and secret from environment variables
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing Spotify credentials');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error', 
        detail: 'Missing Spotify credentials' 
      })
    };
  }

  try {
    // Get an access token from Spotify
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Error getting Spotify token:', tokenData);
      
      // Return more helpful error messages based on the error type
      if (tokenData.error === 'invalid_client') {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Failed to authenticate with Spotify',
            message: 'Invalid Spotify client credentials. Please see FIX_SPOTIFY_CREDENTIALS.md for instructions on how to fix this issue.',
            details: tokenData
          })
        };
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to authenticate with Spotify',
          message: tokenData.error_description || 'Spotify API returned an error',
          details: tokenData
        })
      };
    }

    // Search Spotify using the token
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      }
    );

    const spotifyData = await spotifyResponse.json();

    if (!spotifyResponse.ok) {
      console.error('Error from Spotify API:', spotifyData);
      return {
        statusCode: spotifyResponse.status,
        headers,
        body: JSON.stringify({ 
          error: 'Error from Spotify API', 
          message: spotifyData.error.message || 'Spotify API returned an error',
          details: spotifyData
        })
      };
    }

    // Process and return the response
    const tracks = spotifyData.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      uri: track.uri,
      artists: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration_ms: track.duration_ms,
      album_art: track.album.images[0]?.url || null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        tracks,
        total: spotifyData.tracks.total
      })
    };
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An error occurred while searching Spotify',
        message: error.message,
        details: error
      })
    };
  }
};
