#!/bin/bash

# QueueBeats Backend Server Startup Script
# This script starts the FastAPI server using uvicorn
# It activates the Python virtual environment and loads environment variables from the root .env file

# Activate the Python virtual environment
source .venv/bin/activate

# Load environment variables from parent directory
source ../.env

# Use the BACKEND_PORT from .env or default to 8001
PORT=${BACKEND_PORT:-8001}
echo "Starting backend server on port $PORT"

# Start the FastAPI application with uvicorn
# --reload: Enable auto-reload when code changes
# --port: Specify the port to run on
uvicorn main:app --reload --port $PORT
