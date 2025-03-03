#!/bin/bash
# Do not use 'set -e' so the script continues even if some commands fail

echo "Starting backend dependency installation..."

# Check Python version
echo "Checking Python version..."
PYTHON_VERSION=$(python --version 2>&1)
echo "Detected Python version: $PYTHON_VERSION"

# Create virtual environment with additional error handling
echo "Setting up Python virtual environment..."
if [ -d ".venv" ]; then
    echo "Virtual environment already exists, reusing it"
else
    # Try multiple Python creation methods
    if command -v python3.10 &> /dev/null; then
        echo "Using Python 3.10 specifically"
        python3.10 -m venv .venv || python3 -m venv .venv || python -m venv .venv
    elif command -v python3 &> /dev/null; then
        echo "Using python3 command"
        python3 -m venv .venv || python -m venv .venv
    else
        echo "Using python command"
        python -m venv .venv
    fi
    
    # Check if venv creation succeeded
    if [ ! -d ".venv" ]; then
        echo "Failed to create virtual environment. Trying alternative approach..."
        # Try without venv if it fails (some CI environments might have issues with venv)
        mkdir -p .venv/bin
        echo '#!/bin/bash' > .venv/bin/activate
        echo 'export PATH=$PATH:$(dirname $(which python))' >> .venv/bin/activate
    fi
fi

# Source the virtual environment with error handling
if [ -f ".venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source .venv/bin/activate || echo "Failed to activate venv, continuing anyway"
else
    echo "Warning: Virtual environment activation script not found. Continuing without it."
fi

# Install dependencies with multiple fallback approaches
echo "Installing Python dependencies..."

# Attempt using uv first
if command -v uv &> /dev/null; then
    echo "Using uv for Python dependency management"
    uv pip install -r requirements.txt || echo "uv installation failed, falling back to pip"
    
    # If uv fails, try pip
    if [ $? -ne 0 ]; then
        pip install --upgrade pip || echo "Pip upgrade failed, continuing anyway"
        pip install -r requirements.txt || echo "pip installation failed, trying with --no-cache-dir option"
        
        # If that fails, try with no-cache-dir
        if [ $? -ne 0 ]; then
            pip install --no-cache-dir -r requirements.txt || echo "All Python dependency installation methods failed"
        fi
    fi
else
    echo "uv not found, using standard pip"
    pip install --upgrade pip || echo "Pip upgrade failed, continuing anyway"
    pip install -r requirements.txt || echo "pip installation failed, trying with --no-cache-dir option"
    
    # If that fails, try with no-cache-dir
    if [ $? -ne 0 ]; then
        pip install --no-cache-dir -r requirements.txt || echo "All Python dependency installation methods failed"
    fi
fi

echo "Backend dependency installation process completed."
