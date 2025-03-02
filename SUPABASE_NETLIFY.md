# Supabase Integration with Netlify

This guide covers how to properly set up your Supabase project to work with your Netlify-deployed QueueBeats application.

## Supabase Configuration

### 1. CORS Settings

For your Netlify-deployed application to communicate with Supabase, you need to configure CORS settings in your Supabase project:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Project Settings** → **API**
4. Under **CORS (Cross-Origin Resource Sharing)**, add your Netlify domains:
   - `https://your-site-name.netlify.app`
   - `https://your-custom-domain.com` (if you have one)
   - For local development: `http://localhost:5280`

### 2. Database Structure

Ensure your Supabase database has the required tables:

```sql
-- Parties table (for DJ/host-created events)
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  host_id UUID REFERENCES auth.users(id),
  share_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  max_queue_length INTEGER DEFAULT 50,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Queue items table (for songs added to the queue)
CREATE TABLE queue_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_art_url TEXT,
  duration_ms INTEGER,
  added_by TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  played_at TIMESTAMP WITH TIME ZONE,
  is_played BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  position INTEGER,
  spotify_uri TEXT
);

-- Create policies for access control
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to parties with share codes
CREATE POLICY "Public read access for parties with share codes" 
  ON parties FOR SELECT 
  USING (true);

-- Allow authenticated users to create parties
CREATE POLICY "Authenticated users can create parties" 
  ON parties FOR INSERT 
  TO authenticated 
  USING (true);

-- Allow party hosts to update their own parties
CREATE POLICY "Party hosts can update their own parties" 
  ON parties FOR UPDATE 
  TO authenticated 
  USING (host_id = auth.uid());

-- Allow public access to queue items for any party
CREATE POLICY "Public read access for queue items" 
  ON queue_items FOR SELECT 
  USING (true);

-- Allow anyone to add queue items
CREATE POLICY "Anyone can add queue items" 
  ON queue_items FOR INSERT 
  USING (true);

-- Create indexes for performance
CREATE INDEX party_host_id_idx ON parties(host_id);
CREATE INDEX queue_items_party_id_idx ON queue_items(party_id);
CREATE INDEX queue_items_position_idx ON queue_items(party_id, position);
```

### 3. Setting Up Supabase Auth

If you plan to use authentication:

1. Go to **Authentication** → **Providers**
2. Enable the authentication methods you need (Email, Social providers, etc.)
3. For Email authentication:
   - Configure whether you want to require email confirmation
   - Customize the email templates

## Netlify Environment Variables

Ensure the following Supabase-related environment variables are set in your Netlify site settings:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following:
   - `SUPABASE_URL`: Your Supabase project URL (e.g., `https://yourproject.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Testing Your Integration

After deploying to Netlify:

1. Visit your deployed site
2. Open your browser's developer tools
3. Check the Network tab when the app loads
4. Verify that requests to Supabase are successful (no CORS errors)
5. Test both public and authenticated features

## Troubleshooting

### CORS Errors

If you see CORS errors in the console:
- Double-check your CORS configuration in Supabase
- Ensure the exact domain is added (including `https://` and no trailing slashes)
- Remember that CORS changes can take a few minutes to propagate

### Authentication Issues

If authentication isn't working:
- Check your Supabase URL and anon key in the Netlify environment variables
- Verify that the auth providers are properly configured in Supabase
- Check the Redirect URLs in Supabase for OAuth providers

### Database Access Issues

If you can't read/write to the database:
- Check your Row Level Security (RLS) policies
- Verify that your tables have the correct structure
- Test queries directly in the Supabase SQL editor to isolate the issue
