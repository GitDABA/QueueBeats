CREATE TABLE public.spotify_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add appropriate indexes
CREATE INDEX idx_spotify_tokens_user_id ON public.spotify_tokens(user_id);

-- Set up row-level security
ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tokens" ON public.spotify_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updating the updated_at timestamp
CREATE TRIGGER update_spotify_tokens_updated_at
BEFORE UPDATE ON public.spotify_tokens
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
