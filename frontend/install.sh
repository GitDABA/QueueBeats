#!/bin/bash
# Don't use 'set -e' so we can handle errors gracefully

echo "Starting frontend dependency installation..."

# Check if yarn is available
if command -v yarn &> /dev/null; then
    echo "Using Yarn for frontend dependency management"
    # Try to use corepack if available
    if command -v corepack &> /dev/null; then
        echo "Enabling corepack"
        corepack enable || echo "Failed to enable corepack, continuing anyway"
        yarn set version stable || echo "Failed to set yarn version, continuing anyway"
    else
        echo "Corepack not available, using system yarn"
    fi
    
    # Try yarn install with fallback options
    yarn install --legacy-peer-deps || yarn install --ignore-engines --legacy-peer-deps || yarn install --network-timeout 300000 --legacy-peer-deps
    
    # Only run this in local development, not in CI/CD
    if [ "$CI" != "true" ] && [ -z "$NETLIFY" ]; then
        echo "Setting up VS Code SDK"
        yarn dlx @yarnpkg/sdks vscode || echo "VS Code SDK setup failed, continuing anyway"
    fi
else
    echo "Yarn not available, falling back to npm for frontend dependency management"
    # Try npm install with fallback options
    npm install --legacy-peer-deps || npm install --no-fund --no-audit --legacy-peer-deps || npm install --prefer-offline --legacy-peer-deps
fi

echo "Frontend dependency installation completed."
