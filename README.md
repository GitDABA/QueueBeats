# QueueBeats - Party Music Queue App

QueueBeats is a real-time music queue application for parties and events, allowing guests to add songs to a shared queue controlled by a DJ or host.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with custom dark theme
- **State Management**: Zustand
- **API Integration**: Supabase Client & API client

### Backend
- **API Framework**: Python FastAPI
- **Database**: Supabase (PostgreSQL with realtime capabilities)
- **Authentication**: Supabase Auth
- **Music Integration**: Spotify Web API

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (v3.13 or later)
- [Supabase Account](https://supabase.com) with a project set up

### Documentation

- [API Paths and Port Configuration](./API_PATHS.md) - Details on API structure and ports
- [Spotify Setup Guide](./SPOTIFY_SETUP.md) - Setting up Spotify integration
- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Configuring Supabase for QueueBeats

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd queue-beats
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your Supabase credentials and other configuration.

### Install Dependencies

Using the setup script (recommended):
```bash
./setup.sh
```

Using make:
```bash
make install
```

Or manually:
```bash
# Install all dependencies (root, frontend, and backend)
./dependency_installation.sh
```

### Start Development Servers

**Option 1: Start both servers with a single command**
```bash
# This will start both frontend and backend servers concurrently
npm start
```

**Option 2: Using make in separate terminals**
```bash
# In one terminal
make run-frontend

# In another terminal
make run-backend
```

**Option 3: Using npm scripts in separate terminals**
```bash
# In one terminal
npm run start:frontend

# In another terminal
npm run start:backend
```

**Option 4: Using run scripts directly**
```bash
# In one terminal
cd frontend && ./run.sh

# In another terminal
cd backend && ./run.sh
```

**Option 5: Using the start-all.sh script**
```bash
# This will start both servers in the background
./start-all.sh
```

### Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173) (configurable via FRONTEND_PORT in .env)
- Backend API: [http://localhost:8001](http://localhost:8001) (configurable via BACKEND_PORT in .env)

## Configuration Files

- **Root .env**: Contains environment variables used by both frontend and backend
- **Frontend .env.development**: Frontend-specific environment variables for development
- **Backend routers.json**: Configuration for API routes and authentication settings

## Deployment to Netlify

This project is configured for easy deployment to Netlify. For detailed deployment instructions, see [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md).

Quick deployment steps:

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build:netlify`
3. Set the publish directory to `frontend/dist`
4. Add your environment variables in the Netlify dashboard

## Project Structure

```
queue-beats/
├── backend/             # Python FastAPI backend
│   ├── app/             # Application code
│   │   ├── apis/        # API endpoints and services
│   │   └── ...          # Other backend modules
│   ├── netlify/         # Netlify Functions adapter
│   ├── install.sh       # Backend dependency installation script
│   ├── run.sh           # Backend server startup script
│   └── ...              # Backend configuration files
├── frontend/            # React frontend
│   ├── public/          # Static assets
│   ├── src/             # Source code
│   ├── install.sh       # Frontend dependency installation script
│   ├── run.sh           # Frontend server startup script
│   └── ...              # Frontend configuration files
├── netlify.toml         # Netlify deployment configuration
├── setup.sh             # Project setup script
├── dependency_installation.sh # Dependency installation script
├── start-all.sh         # Script to start both servers
└── ...                  # Project configuration files
```

## Supabase Integration

This project uses Supabase for:
- Database storage (PostgreSQL)
- Real-time updates
- User authentication
- Row-level security

Ensure your Supabase project has the correct tables set up according to the schema used in the application.

## Development Notes

- The frontend's Vite development server proxies API requests to the backend
- For local development, the backend runs on port 8001, and the frontend on port 5173
- The application uses real-time subscriptions for the queue updates

## Netlify Functions

QueueBeats includes Netlify Functions that can be used for:
- Running serverless API endpoints
- Handling authentication flows
- Processing Spotify API requests
- Adding songs to queues

### Using Netlify Functions Locally

1. Install the Netlify CLI if you haven't already:
   ```bash
   npm install -g netlify-cli
   ```

2. Make sure your `.env.netlify` file is set up with the necessary environment variables:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the Netlify development server:
   ```bash
   netlify dev
   ```

4. This will start a local development server that simulates the Netlify environment and makes your functions available at `http://localhost:8888/.netlify/functions/[function-name]`

5. To test your Netlify Functions, run the interactive test script:
   ```bash
   npm run netlify:test
   ```
   This script will guide you through testing the available functions.

### Available Functions

- `spotify-search` - Search for tracks on Spotify
- `songs-add` - Add a song to a queue
- `env-test` - Verify environment variables are correctly loaded

For more detailed documentation on the Netlify Functions, see [NETLIFY_FUNCTIONS.md](./NETLIFY_FUNCTIONS.md).

## Troubleshooting

- If you encounter issues with the Supabase connection, verify your credentials in the `.env` file
- For Netlify deployment issues, check the function logs in the Netlify dashboard
- If servers fail to start, check that the ports (5173 for frontend, 8001 for backend) are not in use
- Make sure all shell scripts have execute permissions (`chmod +x *.sh`)
- If Netlify Functions aren't working, check your `.env.netlify` file and ensure you're using the correct API endpoints
