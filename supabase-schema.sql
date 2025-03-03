-- Supabase SQL Schema for QueueBeats Application

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create queues table
CREATE TABLE IF NOT EXISTS public.queues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.profiles(id) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  access_code TEXT,
  settings JSONB
);

-- Create songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  queue_id UUID REFERENCES public.queues(id) NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER,
  added_by UUID REFERENCES public.profiles(id) NOT NULL,
  track_uri TEXT,
  cover_url TEXT,
  played BOOLEAN DEFAULT FALSE,
  played_at TIMESTAMP WITH TIME ZONE,
  position INTEGER
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  song_id UUID REFERENCES public.songs(id) NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  vote_count INTEGER DEFAULT 1,
  UNIQUE(song_id, profile_id)
);

-- Row Level Security Policies

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Queues table policies
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Queues are viewable by everyone." 
ON public.queues FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create queues." 
ON public.queues FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own queues." 
ON public.queues FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own queues." 
ON public.queues FOR DELETE 
USING (auth.uid() = creator_id);

-- Songs table policies
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Songs are viewable by everyone." 
ON public.songs FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can add songs." 
ON public.songs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Queue creators can update songs." 
ON public.songs FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.queues q 
  WHERE q.id = queue_id AND q.creator_id = auth.uid()
));

CREATE POLICY "Queue creators can delete songs." 
ON public.songs FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.queues q 
  WHERE q.id = queue_id AND q.creator_id = auth.uid()
));

-- Votes table policies
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone." 
ON public.votes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can vote." 
ON public.votes FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = profile_id);

CREATE POLICY "Users can update their own votes." 
ON public.votes FOR UPDATE 
USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own votes." 
ON public.votes FOR DELETE 
USING (auth.uid() = profile_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_queues_creator_id ON public.queues(creator_id);
CREATE INDEX IF NOT EXISTS idx_songs_queue_id ON public.songs(queue_id);
CREATE INDEX IF NOT EXISTS idx_songs_added_by ON public.songs(added_by);
CREATE INDEX IF NOT EXISTS idx_votes_song_id ON public.votes(song_id);
CREATE INDEX IF NOT EXISTS idx_votes_profile_id ON public.votes(profile_id);

-- Trigger to update 'updated_at' field on profiles
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Function to add a profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
