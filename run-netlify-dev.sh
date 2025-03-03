#!/bin/bash
# Script to run Netlify Dev server for local development

# Make script executable
if [ ! -x "$0" ]; then
  chmod +x "$0"
  echo "Made script executable"
fi

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
  echo "Installing netlify-cli globally..."
  npm install -g netlify-cli
fi

# Check if node_fetch and dotenv are installed in functions directory
if [ ! -d "./netlify/functions/node_modules/node-fetch" ] || [ ! -d "./netlify/functions/node_modules/dotenv" ]; then
  echo "Installing dependencies for Netlify functions..."
  cd ./netlify/functions
  npm install
  cd ../..
fi

# Set environment variables for local development
export NETLIFY=true
export VITE_USE_NETLIFY_FUNCTIONS=true

# Load environment variables from .env file
if [ -f ".env" ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo "Warning: .env file not found. Environment variables may be missing."
  echo "Please create a .env file based on .env.example before continuing."
  exit 1
fi

# Validate required environment variables
required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "SPOTIFY_CLIENT_ID" "SPOTIFY_CLIENT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "Error: The following required environment variables are missing:"
  for var in "${missing_vars[@]}"; do
    echo "  - $var"
  done
  echo "Please add them to your .env file before continuing."
  exit 1
fi

echo "Environment validation successful. All required variables present."

# Run Netlify Dev
echo "Starting Netlify Dev server..."
echo "This will make your functions available at http://localhost:8888/.netlify/functions/"

# Run with configuration to use netlify/functions directory
netlify dev --functions=netlify/functions --port=8888
