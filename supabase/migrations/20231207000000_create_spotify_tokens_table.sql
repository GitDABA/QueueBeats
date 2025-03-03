-- Create a table to store Spotify tokens
CREATE TABLE IF NOT EXISTS spotify_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Add RLS policies
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own tokens
CREATE POLICY "Users can read their own spotify tokens"
  ON spotify_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert or update their own tokens
CREATE POLICY "Users can insert their own spotify tokens"
  ON spotify_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spotify tokens"
  ON spotify_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at on updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on updates
CREATE TRIGGER update_spotify_tokens_updated_at
  BEFORE UPDATE ON spotify_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
