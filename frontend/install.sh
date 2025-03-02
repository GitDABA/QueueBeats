#!/bin/bash
set -e

# Check if yarn is available
if command -v yarn &> /dev/null; then
    echo "Using Yarn for frontend dependency management"
    # Try to use corepack if available
    if command -v corepack &> /dev/null; then
        echo "Enabling corepack"
        corepack enable
        yarn set version stable
    else
        echo "Corepack not available, using system yarn"
    fi
    
    yarn install
    
    # Only run this in local development, not in CI/CD
    if [ "$CI" != "true" ] && [ -z "$NETLIFY" ]; then
        echo "Setting up VS Code SDK"
        yarn dlx @yarnpkg/sdks vscode
    fi
else
    echo "Yarn not found, using npm"
    npm install
fi
