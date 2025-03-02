#!/bin/bash

# QueueBeats setup script
echo "Setting up QueueBeats project..."

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  echo "Please edit the .env file with your Supabase credentials"
fi

# Install dependencies
echo "Installing project dependencies..."
npm install

# Make sure installation scripts are executable
chmod +x backend/install.sh
chmod +x backend/run.sh
chmod +x frontend/install.sh
chmod +x frontend/run.sh

echo "Setup complete! You can now run the project with:"
echo "npm start"
echo ""
echo "Or use the individual commands:"
echo "npm run start:frontend"
echo "npm run start:backend"
