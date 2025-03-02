#!/bin/bash
set -e

echo "Clearing Vite cache and node_modules..."
rm -rf node_modules/.vite

echo "Clearing dist folder..."
rm -rf dist

echo "Rebuilding the application..."
yarn build

echo "Starting development server with clean cache..."
yarn dev --force
