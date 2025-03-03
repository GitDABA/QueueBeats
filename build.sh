#!/bin/bash
set -e

echo "=== ENVIRONMENT INFO ==="
python3 --version
node --version
npm --version
echo "======================="

# Frontend build
echo "Building frontend..."
cd frontend 
npm install
npm run build
cd ..

# Use system Python (don't try to install a specific version)
echo "Setting up backend..."
python3 -m pip install --upgrade pip

# Install requirements to function directory
python3 -m pip install -r backend/requirements.txt --target ./netlify/functions/deps

echo "Build complete!"
