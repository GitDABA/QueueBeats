// Netlify Serverless Function for Database Health Check
require('dotenv').config(); // Load environment variables from .env file
const { createClient } = require('@supabase/supabase-js');
const { headers } = require('./utils/cors-headers');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Create Supabase client with service role key
  // Service role is required for database health check operations
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server configuration error - missing environment variables' 
      })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Running database health check...');

    // Option 1: Run the dedicated health check function
    const { data: healthCheckResult, error: healthCheckError } = await supabase
      .rpc('check_database_health');

    if (healthCheckError) {
      console.error('Error running health check function:', healthCheckError);
      
      // If the function doesn't exist, fall back to manual checks
      console.log('Falling back to manual table checks...');
      return await performManualHealthCheck(supabase);
    }

    console.log('Health check completed successfully:', healthCheckResult);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        data: healthCheckResult 
      })
    };
  } catch (error) {
    console.error('Unexpected error during health check:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Unexpected error during health check',
        details: error.message
      })
    };
  }
};

// Fallback manual health check if the function doesn't exist
async function performManualHealthCheck(supabase) {
  try {
    // List of required tables
    const requiredTables = [
      'health_check',
      'spotify_tokens',
      'queues',
      'queue_tracks',
      'user_settings',
      'setup_log'
    ];
    
    // Check which tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', requiredTables);
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Error checking database tables',
          details: tablesError.message 
        })
      };
    }
    
    // Get list of existing table names
    const existingTables = tablesData.map(row => row.table_name);
    
    // Find missing tables
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    // Determine health status
    const isHealthy = missingTables.length === 0;
    
    // Create result object
    const result = {
      status: isHealthy ? 'healthy' : 'missing_tables',
      existing_tables: existingTables,
      missing_tables: missingTables,
      timestamp: new Date().toISOString()
    };
    
    // Try to update health_check table if it exists
    if (existingTables.includes('health_check')) {
      await supabase
        .from('health_check')
        .update({ 
          last_checked: new Date().toISOString(),
          status: result.status,
          notes: 'Manual database health check'
        })
        .order('last_checked', { ascending: false })
        .limit(1);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        data: result,
        note: 'Used manual check because check_database_health function not available'
      })
    };
  } catch (error) {
    console.error('Error in manual health check:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Error performing manual health check',
        details: error.message 
      })
    };
  }
}
