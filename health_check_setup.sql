-- QueueBeats Database Health Check and Auto-Setup Script
-- This script checks for required tables and creates them if they don't exist

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to log database setup events
CREATE OR REPLACE FUNCTION log_db_setup_event(event_name TEXT, event_details TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.setup_log (event_name, event_details)
  VALUES (event_name, event_details);
EXCEPTION
  WHEN undefined_table THEN
    -- Create setup_log table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.setup_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_name TEXT NOT NULL,
      event_details TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Try insert again
    INSERT INTO public.setup_log (event_name, event_details)
    VALUES (event_name, event_details);
END;
$$ LANGUAGE plpgsql;

-- Create health_check table for backend verification
CREATE TABLE IF NOT EXISTS public.health_check (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'active',
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version TEXT,
  notes TEXT
);

-- Insert initial health check record for testing
INSERT INTO public.health_check (status, version, notes)
VALUES ('active', '1.0.0', 'Initial health check record')
ON CONFLICT DO NOTHING;

SELECT log_db_setup_event('health_check_table', 'Created or verified health_check table');

-- Create spotify_tokens table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spotify_tokens'
  ) THEN
    CREATE TABLE public.spotify_tokens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at BIGINT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add Row Level Security (RLS) to spotify_tokens
    ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow users to only see their own tokens
    CREATE POLICY "Users can only access their own spotify tokens" 
      ON public.spotify_tokens
      FOR ALL
      USING (auth.uid() = user_id);
      
    -- Create policy for service role (admin) access
    CREATE POLICY "Service role can access all tokens" 
      ON public.spotify_tokens
      FOR ALL
      TO service_role
      USING (true);
      
    PERFORM log_db_setup_event('spotify_tokens_table', 'Created spotify_tokens table with RLS');
  ELSE
    PERFORM log_db_setup_event('spotify_tokens_table', 'spotify_tokens table already exists');
  END IF;
END $$;

-- Create queues table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'queues'
  ) THEN
    CREATE TABLE public.queues (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      active BOOLEAN DEFAULT true,
      access_code TEXT,
      settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS to queues
    ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
    
    -- Policy for queue owner access
    CREATE POLICY "Queue owners can manage their queues" 
      ON public.queues
      FOR ALL
      USING (auth.uid() = creator_id);
      
    -- Policy for public queues access (read-only)
    CREATE POLICY "Public queues are viewable by all users" 
      ON public.queues
      FOR SELECT
      USING ((settings->>'is_public')::boolean = true);
      
    PERFORM log_db_setup_event('queues_table', 'Created queues table with RLS');
  ELSE
    PERFORM log_db_setup_event('queues_table', 'queues table already exists');
  END IF;
END $$;

-- Create queue_tracks table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'queue_tracks'
  ) THEN
    CREATE TABLE public.queue_tracks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      queue_id UUID NOT NULL REFERENCES public.queues(id) ON DELETE CASCADE,
      track_uri TEXT NOT NULL,
      track_name TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      album_name TEXT,
      album_art_url TEXT,
      duration_ms INTEGER,
      added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      position INTEGER NOT NULL,
      is_played BOOLEAN DEFAULT false,
      played_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS to queue_tracks
    ALTER TABLE public.queue_tracks ENABLE ROW LEVEL SECURITY;
    
    -- Join with queues to determine access rights
    CREATE POLICY "Users can view tracks in queues they can access" 
      ON public.queue_tracks
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.queues q 
          WHERE q.id = queue_id 
          AND (q.creator_id = auth.uid() OR (q.settings->>'is_public')::boolean = true)
        )
      );
      
    -- Policy for adding/managing tracks
    CREATE POLICY "Queue owners can manage tracks" 
      ON public.queue_tracks
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.queues q 
          WHERE q.id = queue_id AND q.creator_id = auth.uid()
        )
      );
      
    PERFORM log_db_setup_event('queue_tracks_table', 'Created queue_tracks table with RLS');
  ELSE
    PERFORM log_db_setup_event('queue_tracks_table', 'queue_tracks table already exists');
  END IF;
END $$;

-- Create user_settings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings'
  ) THEN
    CREATE TABLE public.user_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      theme TEXT DEFAULT 'light',
      notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
      default_queue_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT unique_user_settings UNIQUE (user_id)
    );
    
    -- Add RLS to user_settings
    ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
    
    -- Policy for user settings access
    CREATE POLICY "Users can only access their own settings" 
      ON public.user_settings
      FOR ALL
      USING (auth.uid() = user_id);
      
    PERFORM log_db_setup_event('user_settings_table', 'Created user_settings table with RLS');
  ELSE
    PERFORM log_db_setup_event('user_settings_table', 'user_settings table already exists');
  END IF;
END $$;

-- Create function to check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if all required tables exist
  WITH required_tables AS (
    SELECT 'health_check' AS table_name UNION
    SELECT 'spotify_tokens' UNION
    SELECT 'queues' UNION
    SELECT 'queue_tracks' UNION
    SELECT 'user_settings' UNION
    SELECT 'setup_log'
  ),
  existing_tables AS (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (SELECT table_name FROM required_tables)
  )
  SELECT json_build_object(
    'status', CASE 
      WHEN COUNT(*) = (SELECT COUNT(*) FROM required_tables) THEN 'healthy' 
      ELSE 'missing_tables' 
    END,
    'existing_tables', json_agg(table_name),
    'missing_tables', (
      SELECT json_agg(rt.table_name)
      FROM required_tables rt
      LEFT JOIN existing_tables et ON rt.table_name = et.table_name
      WHERE et.table_name IS NULL
    ),
    'timestamp', NOW()
  ) INTO result
  FROM existing_tables;
  
  -- Update health_check table with latest check
  UPDATE public.health_check
  SET last_checked = NOW(),
      status = (result->>'status'),
      notes = 'Automatic database health check'
  WHERE id = (SELECT id FROM public.health_check ORDER BY last_checked DESC LIMIT 1);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Run health check and report status
SELECT check_database_health();
