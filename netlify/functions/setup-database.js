const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  // Use environment variables for the URL and SERVICE_ROLE key (not anon key)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Ensure we have the required environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables for Supabase connection');
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Server misconfiguration - missing required environment variables' 
      })
    };
  }
  
  // Create Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('Attempting to create spotify_tokens table via serverless function');
    
    // Create the table if it doesn't exist
    const { data, error } = await supabase.rpc('create_spotify_tokens_table');
    
    if (error) {
      console.error('Error creating table:', error);
      
      // If the function doesn't exist, we need to handle that specially
      if (error.message && error.message.includes('function "create_spotify_tokens_table" does not exist')) {
        return createTableDirectly(supabase);
      }
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          message: `Failed to create database table: ${error.message}` 
        })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(data || { success: true, message: 'Table created or already exists' })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: `Internal server error: ${error.message || 'Unknown error'}` 
      })
    };
  }
};

// Fallback method that tries to create the table directly with SQL
async function createTableDirectly(supabase) {
  try {
    console.log('Attempting to create table directly via SQL...');
    
    // First check if the table already exists
    const { data: tableExists, error: checkError } = await supabase.rpc(
      'table_exists',
      { table_name: 'spotify_tokens' }
    );
    
    // If even the table_exists function doesn't exist, we're out of options
    if (checkError && checkError.message && checkError.message.includes('function "table_exists" does not exist')) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          message: 'Database setup requires administrator to create helper functions' 
        })
      };
    }
    
    // If table already exists, we're done
    if (tableExists) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Table already exists' })
      };
    }
    
    // Create the table with raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.spotify_tokens (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        access_token text NOT NULL,
        refresh_token text NOT NULL,
        expires_at bigint NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );
      
      -- Create index if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'spotify_tokens_user_id_idx'
        ) THEN
          CREATE INDEX spotify_tokens_user_id_idx ON public.spotify_tokens(user_id);
        END IF;
      END
      $$;
      
      -- Add unique constraint if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'spotify_tokens_user_id_key' 
          AND table_name = 'spotify_tokens'
        ) THEN
          ALTER TABLE public.spotify_tokens ADD CONSTRAINT spotify_tokens_user_id_key UNIQUE (user_id);
        END IF;
      END
      $$;
      
      -- Enable RLS
      ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
      
      -- Create policy if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE policyname = 'Users can only access their own tokens' 
          AND tablename = 'spotify_tokens'
        ) THEN
          CREATE POLICY "Users can only access their own tokens"
            ON public.spotify_tokens
            FOR ALL
            USING (auth.uid() = user_id);
        END IF;
      END
      $$;
    `;
    
    const { error: sqlError } = await supabase.rpc(
      'run_sql',
      { sql: createTableSQL }
    );
    
    if (sqlError) {
      console.error('Error running direct SQL:', sqlError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          message: `Failed to create table with SQL: ${sqlError.message}`,
          note: 'Please contact an administrator to set up the database' 
        })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Table created successfully via direct SQL' })
    };
  } catch (error) {
    console.error('Error in createTableDirectly:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: `Failed to create table directly: ${error.message || 'Unknown error'}` 
      })
    };
  }
}
