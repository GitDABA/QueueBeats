#!/bin/bash
set -e

# Check if uv is installed, if not use pip
if command -v uv &> /dev/null; then
    echo "Using uv for Python dependency management"
    uv venv
    source .venv/bin/activate
    uv pip install -r requirements.txt
else
    echo "uv not found, using standard pip"
    python -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
fi
