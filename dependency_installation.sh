#!/bin/bash

echo "Starting dependency installation..."

# Print system information for debugging
echo "=== SYSTEM INFORMATION ==="
uname -a
echo "Node: $(node --version 2>/dev/null || echo 'not installed')"
echo "NPM: $(npm --version 2>/dev/null || echo 'not installed')"
echo "Python: $(python --version 2>&1 || echo 'not installed')"
echo "Python3: $(python3 --version 2>&1 || echo 'not installed')"
echo "=========================="

# Install root dependencies
echo "Installing root dependencies..."
npm install || echo "Warning: Root npm install had issues, continuing anyway"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
bash ./install.sh
FRONTEND_STATUS=$?
cd ..
if [ $FRONTEND_STATUS -ne 0 ]; then
    echo "Warning: Frontend dependencies installation had issues, continuing anyway"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
bash ./install.sh
BACKEND_STATUS=$?
cd ..
if [ $BACKEND_STATUS -ne 0 ]; then
    echo "Warning: Backend dependencies installation had issues, continuing anyway"
fi

echo "Dependency installation process completed."
echo "Note: Check logs above for any warning messages or installation issues."
exit 0
