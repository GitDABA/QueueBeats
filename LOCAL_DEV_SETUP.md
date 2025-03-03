# QueueBeats Local Development Setup

This guide provides step-by-step instructions for setting up and running the QueueBeats application in your local development environment.

## Prerequisites

- Node.js 18+ (LTS version recommended)
- npm or yarn
- Git
- A Supabase account and project
- A Spotify Developer account and application

## Step 1: Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/queue-beats.git
   cd queue-beats
   ```

2. Copy the example environment file and update it with your credentials:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` in your editor and update the following values:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `SPOTIFY_CLIENT_ID`: Your Spotify application client ID
   - `SPOTIFY_CLIENT_SECRET`: Your Spotify application client secret

## Step 2: Install Dependencies

Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

Install the backend dependencies:

```bash
cd backend
npm install
cd ..
```

Install the Netlify functions dependencies:

```bash
cd netlify/functions
npm install
cd ../..
```

## Step 3: Database Setup

### Option 1: Using Supabase Web Interface

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `health_check_setup.sql`
4. Run the SQL in the Supabase SQL Editor

### Option 2: Using the CLI

If you have the Supabase CLI set up:

```bash
cat health_check_setup.sql | supabase db execute
```

## Step 4: Start the Services

For full functionality, you'll need to run multiple services concurrently.

### Option 1: Run Services in Separate Terminals

**Terminal 1: Frontend Server**
```bash
cd frontend
npm run dev
```

**Terminal 2: Netlify Functions**
```bash
# From project root
./run-netlify-dev.sh
```

**Terminal 3: Backend Server (if needed)**
```bash
cd backend
npm run dev
```

### Option 2: Use a Process Manager Like Concurrently

Install concurrently:
```bash
npm install -g concurrently
```

Add this to package.json:
```json
"scripts": {
  "dev:all": "concurrently \"cd frontend && npm run dev\" \"./run-netlify-dev.sh\" \"cd backend && npm run dev\""
}
```

Then run:
```bash
npm run dev:all
```

## Step 5: Verify It's Working

1. Navigate to http://localhost:5173 in your browser to see the frontend
2. Test the Netlify functions:
   ```bash
   ./test-functions.sh
   ```
3. Check the database health in your browser by navigating to:
   http://localhost:5173/debug/database

## Troubleshooting

### 404 Errors with Netlify Functions

If you're getting 404 errors for Netlify functions:

1. Ensure that Netlify Dev is running
2. Check the netlify.toml has the correct configuration
3. Verify that you've installed the dependencies for the functions
4. Look at the Netlify Dev console for any errors

See the [NETLIFY_FUNCTIONS.md](./NETLIFY_FUNCTIONS.md) file for more detailed troubleshooting.

### Database Connection Issues

If you have issues connecting to Supabase:

1. Verify that your environment variables are correct
2. Make sure your Supabase project is active
3. Check that your IP is allowed in Supabase's network restrictions
4. Run the database health check function to identify specific issues

### Missing Node Modules

If you get module not found errors:

```bash
# Run this command to ensure all dependencies are installed
npm run install:all
```

## Advanced: Testing with Specific Versions

If you need to test with specific npm package versions:

```bash
cd frontend
npm install @supabase/supabase-js@2.21.0
cd ../netlify/functions
npm install node-fetch@2.6.9
```

## Development Tips

1. **Working with Supabase locally**:
   Consider setting up a local Supabase instance for development: https://supabase.com/docs/guides/local-development

2. **Spotify API rate limits**:
   Be aware of rate limits when working with the Spotify API. Consider using mocks for development.

3. **Environment switching**:
   To easily switch between development and production:
   ```bash
   # Create a development file
   cp .env .env.dev
   # Create a production file
   cp .env .env.prod
   # Then switch as needed
   cp .env.dev .env
   ```

For more information, refer to:
- [NETLIFY_FUNCTIONS.md](./NETLIFY_FUNCTIONS.md) for details on Netlify Functions
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for general troubleshooting
- [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) for Spotify integration details
