// netlify/functions/songs-add.js
const { loadEnv } = require('./utils/load-env'); // Load environment variables from appropriate .env file
loadEnv();

const { createClient } = require('@supabase/supabase-js');
const { headers } = require('./utils/cors-headers');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        ...headers,
        "Allow": "POST"
      },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error - missing Supabase credentials' 
        })
      };
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const songData = JSON.parse(event.body);
    
    // Basic validation
    if (!songData || !songData.queue_id || !songData.song_id || !songData.user_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: "Invalid song data", 
          detail: "Missing required fields (queue_id, song_id, or user_id)" 
        })
      };
    }
    
    console.log('Adding song to queue:', songData);
    
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Create a song record
    const { data, error } = await supabase
      .from('queue_songs')
      .insert([
        { 
          queue_id: songData.queue_id,
          song_id: songData.song_id,
          added_by: songData.user_id,
          created_at: timestamp,
          status: 'pending'
        }
      ])
      .select();
    
    if (error) {
      console.error('Error adding song to queue:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: "Failed to add song to queue", 
          detail: error.message 
        })
      };
    }
    
    // Return success response
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: "Song added to queue successfully",
        song: data[0]
      })
    };
  } catch (error) {
    console.error('Unexpected error in songs-add function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to add song",
        message: error.message 
      })
    };
  }
};
