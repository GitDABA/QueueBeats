// Test script to verify Spotify credentials
// Force use of hardcoded credentials for testing
// require('dotenv').config();
const fetch = require('node-fetch');

async function testSpotifyAuth() {
  // Use our new credentials directly
  const clientId = '70dc682e12e4452f9973943ac7648737';
  const clientSecret = 'a4d433c09bab4359a25a566f461e72c6';
  
  console.log('Testing Spotify authentication with new credentials:');
  console.log(`Client ID: ${clientId}`);
  console.log(`Client Secret: ${clientSecret?.substring(0, 4)}...${clientSecret?.substring(clientSecret.length - 4)}`);
  
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
      return;
    }
    
    console.log('Successfully obtained Spotify token:');
    console.log(`Token type: ${tokenData.token_type}`);
    console.log(`Expires in: ${tokenData.expires_in} seconds`);
    console.log(`Access token: ${tokenData.access_token.substring(0, 10)}...`);
    
    // Try a simple search to verify the token works
    const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=test&type=track&limit=1`, {
      headers: {
        'Authorization': `${tokenData.token_type} ${tokenData.access_token}`
      }
    });
    
    const searchData = await searchResponse.json();
    
    if (searchData.error) {
      console.error('Error performing search:', searchData.error);
      return;
    }
    
    console.log('\nSearch test successful!');
    console.log(`Found ${searchData.tracks.total} tracks matching "test"`);
    
    // Print the first result
    if (searchData.tracks.items.length > 0) {
      const track = searchData.tracks.items[0];
      console.log(`\nSample track: "${track.name}" by ${track.artists.map(a => a.name).join(', ')}`);
    }
  } catch (error) {
    console.error('Error during Spotify authentication test:', error);
  }
}

// Run the test
testSpotifyAuth();
