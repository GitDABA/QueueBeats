#!/bin/bash
set -e

echo "Starting dependency installation..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
bash ./install.sh
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
bash ./install.sh
cd ..

echo "Dependency installation completed successfully!"
exit 0
