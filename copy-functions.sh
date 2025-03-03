#!/bin/bash

# Script to ensure all functions are correctly copied to the netlify/functions directory
echo "Synchronizing functions..."

# Ensure the netlify/functions directory exists
mkdir -p netlify/functions

# Copy any backend functions to the main netlify/functions directory
if [ -d "backend/netlify/functions" ]; then
  echo "Copying backend functions to main functions directory..."
  cp -r backend/netlify/functions/* netlify/functions/
  
  # Ensure the deps directory exists for Python dependencies
  mkdir -p netlify/functions/deps
  
  # If backend deps exist, copy them too
  if [ -d "backend/netlify/functions/deps" ]; then
    echo "Copying Python dependencies..."
    cp -r backend/netlify/functions/deps/* netlify/functions/deps/
  fi
fi

# List the functions that will be deployed
echo "Functions that will be deployed:"
ls -la netlify/functions/

echo "Function synchronization complete!"
