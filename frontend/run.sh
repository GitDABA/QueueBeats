#!/bin/bash

# QueueBeats Frontend Server Startup Script
# This script starts the Vite development server for the frontend
# It loads environment variables from the root .env file and uses the specified port

# Load environment variables from parent directory
source ../.env

# Use the FRONTEND_PORT from .env or default to 5173
PORT=${FRONTEND_PORT:-5173}
echo "Starting frontend server on port $PORT"

# Use npm instead of yarn to avoid interactive prompts
npm run dev