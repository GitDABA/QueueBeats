-- Function to create the spotify_tokens table
CREATE OR REPLACE FUNCTION public.create_spotify_tokens_table()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
DECLARE
  result json;
BEGIN
  -- Check if table already exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spotify_tokens'
  ) THEN
    result := json_build_object('success', true, 'message', 'Table already exists');
    RETURN result;
  END IF;
  
  -- Create the table
  CREATE TABLE public.spotify_tokens (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    expires_at bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
  );
  
  -- Create index
  CREATE INDEX spotify_tokens_user_id_idx ON public.spotify_tokens(user_id);
  
  -- Add unique constraint
  ALTER TABLE public.spotify_tokens ADD CONSTRAINT spotify_tokens_user_id_key UNIQUE (user_id);
  
  -- Enable RLS
  ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
  
  -- Create policy
  CREATE POLICY "Users can only access their own tokens"
    ON public.spotify_tokens
    FOR ALL
    USING (auth.uid() = user_id);
  
  -- Add trigger for updated_at if the function exists
  IF EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'handle_updated_at'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE TRIGGER update_spotify_tokens_updated_at
    BEFORE UPDATE ON public.spotify_tokens
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
  
  result := json_build_object('success', true, 'message', 'Table created successfully');
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object('success', false, 'message', SQLERRM);
    RETURN result;
END;
$$;

-- Helper function to check if a table exists
CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_val boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_name
  ) INTO exists_val;
  
  RETURN exists_val;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Utility function to run arbitrary SQL (use with caution, admin only)
CREATE OR REPLACE FUNCTION public.run_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql;
  result := json_build_object('success', true, 'message', 'SQL executed successfully');
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object('success', false, 'message', SQLERRM);
    RETURN result;
END;
$$;

-- IMPORTANT: GRANT appropriate permissions for the functions
-- Only administrators should run this part
GRANT EXECUTE ON FUNCTION public.create_spotify_tokens_table() TO authenticated;
GRANT EXECUTE ON FUNCTION public.table_exists(text) TO authenticated;
-- DO NOT grant run_sql to regular users, it should be admin only
-- GRANT EXECUTE ON FUNCTION public.run_sql(text) TO authenticated;
