#!/bin/bash

source .venv/bin/activate

# Load environment variables from parent directory
source ../.env

# Use the BACKEND_PORT from .env or default to 8001
PORT=${BACKEND_PORT:-8001}
echo "Starting backend server on port $PORT"

uvicorn main:app --reload --port $PORT
