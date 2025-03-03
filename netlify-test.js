#!/usr/bin/env node

/**
 * QueueBeats Netlify Functions Test Script
 * 
 * This script tests the Netlify Functions for the QueueBeats application.
 * It's designed to be run in a local development environment with 'netlify dev' running.
 */

const fetch = require('node-fetch');
const readline = require('readline');

// Base URL for the Netlify Functions when using netlify dev
const NETLIFY_DEV_URL = process.env.NETLIFY_DEV_URL || 'http://localhost:8888';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to test the spotify-search Netlify function
async function testSpotifySearch() {
  console.log('\n🎵 Testing Spotify Search Function...');
  
  try {
    // Prompt for search query
    const query = await new Promise(resolve => {
      rl.question('Enter a search query (default: "dancing"): ', answer => {
        resolve(answer || 'dancing');
      });
    });
    
    const limit = 5;
    console.log(`\nSearching for "${query}" (limit: ${limit})...`);
    
    // Call the Netlify function
    const response = await fetch(`${NETLIFY_DEV_URL}/.netlify/functions/spotify-search?query=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('\n✅ Spotify Search Results:');
    
    if (data.tracks && Array.isArray(data.tracks)) {
      data.tracks.forEach((track, index) => {
        console.log(`\n🎵 Track ${index + 1}:`);
        console.log(`  Title: ${track.name}`);
        console.log(`  Artist: ${Array.isArray(track.artists) ? track.artists.join(', ') : track.artists}`);
        console.log(`  Album: ${track.album || 'N/A'}`);
        console.log(`  ID: ${track.id}`);
      });
      
      console.log(`\nFound ${data.tracks.length} tracks. ✅ TEST PASSED`);
      return { success: true, trackId: data.tracks[0]?.id };
    } else {
      console.error('\n❌ Invalid response format. Expected tracks array.');
      console.error('Response:', JSON.stringify(data, null, 2));
      return { success: false };
    }
  } catch (error) {
    console.error('\n❌ Error testing Spotify search:', error.message);
    return { success: false };
  }
}

// Function to test the songs-add Netlify function
async function testSongsAdd(trackId) {
  console.log('\n🎵 Testing Add Song to Queue Function...');
  
  if (!trackId) {
    console.log('❌ No track ID provided, skipping test.');
    return false;
  }
  
  try {
    // Ask for queue ID and user ID
    const queueId = await new Promise(resolve => {
      rl.question('Enter a queue ID (default: "test-queue-123"): ', answer => {
        resolve(answer || 'test-queue-123');
      });
    });
    
    const userId = await new Promise(resolve => {
      rl.question('Enter a user ID (default: "test-user-456"): ', answer => {
        resolve(answer || 'test-user-456');
      });
    });
    
    console.log(`\nAdding track ${trackId} to queue ${queueId} for user ${userId}...`);
    
    // Call the Netlify function
    const response = await fetch(`${NETLIFY_DEV_URL}/.netlify/functions/songs-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queue_id: queueId,
        song_id: trackId,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('\n✅ Add Song Result:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ TEST PASSED - Song added to queue successfully');
      return true;
    } else {
      console.error('\n❌ Failed to add song to queue.');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error testing Add Song to Queue:', error.message);
    return false;
  }
}

// Function to test the env-test Netlify function
async function testEnvVariables() {
  console.log('\n🔍 Testing Environment Variables Function...');
  
  try {
    // Call the Netlify function
    const response = await fetch(`${NETLIFY_DEV_URL}/.netlify/functions/env-test`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('\n✅ Environment Variables Test Results:');
    
    // Display environment variable status
    console.log('\nEnvironment Variable Status:');
    for (const [key, value] of Object.entries(data.env)) {
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${key}`);
    }
    
    // Show safely masked values
    console.log('\nSafe Environment Preview:');
    for (const [key, value] of Object.entries(data.safeEnv)) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Display overall status
    const allVarsPresent = Object.values(data.env).every(Boolean);
    if (allVarsPresent) {
      console.log('\n✅ TEST PASSED - All required environment variables are present');
      return true;
    } else {
      console.warn('\n⚠️ WARNING - Some environment variables are missing');
      console.log('This may cause other functions to fail. Please check your .env files.');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error testing environment variables:', error.message);
    return false;
  }
}

// Main function to run all tests
async function runTests() {
  console.log('🎵 QueueBeats Netlify Functions Test 🎵');
  console.log('============================================');
  console.log(`Base URL: ${NETLIFY_DEV_URL}`);
  console.log('Make sure netlify dev is running before proceeding.');
  console.log('============================================\n');
  
  const continueTest = await new Promise(resolve => {
    rl.question('Continue? (Y/n): ', answer => {
      resolve(answer.toLowerCase() !== 'n');
    });
  });
  
  if (!continueTest) {
    console.log('Tests aborted.');
    rl.close();
    return;
  }
  
  // Test Spotify search
  const searchResult = await testSpotifySearch();
  
  // Test Environment Variables
  console.log('\n---------------------------------------------');
  const envResult = await testEnvVariables();
  
  // Test Add Song to Queue if search was successful
  console.log('\n---------------------------------------------');
  if (searchResult.success && searchResult.trackId) {
    await testSongsAdd(searchResult.trackId);
  } else {
    console.log('\n❌ Skipping Add Song test due to failed search test.');
  }
  
  console.log('\n============================================');
  console.log('🎵 All tests completed!');
  console.log('============================================');
  
  rl.close();
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  rl.close();
});
