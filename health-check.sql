-- Create a simple health check table for testing database connectivity
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  message TEXT
);

-- Insert a test record
INSERT INTO health_check (status, message)
VALUES ('OK', 'Database connection is working properly')
ON CONFLICT DO NOTHING;

-- Enable read access for anonymous users (for connection testing)
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to health_check"
ON health_check FOR SELECT
TO anon
USING (true);
