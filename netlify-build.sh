#!/bin/bash
set -e

# Print environment details
echo "=== Environment Info ==="
echo "Node: $(node -v)"
echo "npm: $(npm -v)"
echo "System Python: $(python3 --version)"
echo "========================="

# Frontend build
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Backend setup - using system Python
echo "Setting up backend..."
# Ensure pip is up to date
python3 -m pip install --upgrade pip setuptools wheel

# Install backend requirements to function directory
echo "Installing Python dependencies..."
python3 -m pip install -r backend/requirements.txt --target ./netlify/functions/python-deps

# Create a simple test function to verify build
echo "Creating test functions..."
mkdir -p netlify/functions

# JavaScript test function
cat > netlify/functions/hello-js.js << 'EOL'
exports.handler = async function() {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from JavaScript function!" })
  };
}
EOL

# Python test function with local deps import
cat > netlify/functions/hello-py.py << 'EOL'
import sys
import os

# Add the local deps directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
deps_dir = os.path.join(current_dir, "python-deps")
sys.path.insert(0, deps_dir)

def handler(event, context):
    # Now we can import installed packages
    import json
    
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Hello from Python function!",
            "python_version": sys.version
        })
    }
EOL

# Copy other functions if a script exists
if [ -f ./copy-functions.sh ]; then
  echo "Running custom function copy script..."
  bash ./copy-functions.sh
fi

echo "Build completed successfully!"
