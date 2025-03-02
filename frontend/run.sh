#!/bin/bash

# Load environment variables from parent directory
source ../.env

# Use the FRONTEND_PORT from .env or default to 5173
PORT=${FRONTEND_PORT:-5173}
echo "Starting frontend server on port $PORT"

# The port is set in vite.config.ts from environment variables
yarn dev