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
- [Python](https://www.python.org/) (v3.9 or later)
- [Supabase Account](https://supabase.com) with a project set up

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

Using make (recommended):
```bash
make install
```

Or manually:
```bash
# Install dependencies
npm install

# This will also install frontend and backend dependencies
```

### Start Development Servers

Using make:
```bash
# In one terminal
make run-frontend

# In another terminal
make run-backend
```

Or using npm:
```bash
# In one terminal
npm run start:frontend

# In another terminal
npm run start:backend
```

### Access the Application

- Frontend: [http://localhost:5280](http://localhost:5280)
- Backend API: [http://localhost:8000](http://localhost:8000)

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
│   └── ...              # Backend configuration files
├── frontend/            # React frontend
│   ├── public/          # Static assets
│   ├── src/             # Source code
│   └── ...              # Frontend configuration files
├── netlify.toml         # Netlify deployment configuration
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
- For local development, the backend runs on port 8000, and the frontend on port 5280
- The application uses real-time subscriptions for the queue updates

## Troubleshooting

- If you encounter issues with the Supabase connection, verify your credentials in the `.env` file
- For Netlify deployment issues, check the function logs in the Netlify dashboard
