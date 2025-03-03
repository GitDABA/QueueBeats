#!/bin/bash
# Script to test Netlify functions

# Make script executable
if [ ! -x "$0" ]; then
  chmod +x "$0"
  echo "Made script executable"
fi

echo "Testing database health check function..."
curl -s "http://localhost:8888/.netlify/functions/database-health-check" | jq

echo ""
echo "Testing Spotify search function..."
curl -s "http://localhost:8888/.netlify/functions/spotify-search?query=adele&limit=2" | jq

echo ""
echo "If you see valid JSON responses, the functions are working!"
echo "If you see 'Connection refused' errors, make sure to start the Netlify Dev server first:"
echo "./run-netlify-dev.sh"
