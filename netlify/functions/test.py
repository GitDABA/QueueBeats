import sys
import os

# Add deps directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "deps"))

def handler(event, context):
    return {
        "statusCode": 200,
        "body": f"Python version: {sys.version}"
    }
