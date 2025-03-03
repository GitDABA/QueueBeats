#!/bin/bash
set -e

echo "Setting up backend functions..."

# Check Python version
python --version

# Install requirements directly (no version manager)
python -m pip install -r backend/requirements.txt --target ./netlify/functions/deps

# Copy functions if needed
if [ -f ./copy-functions.sh ]; then
  bash ./copy-functions.sh
fi

echo "Backend setup complete!"
