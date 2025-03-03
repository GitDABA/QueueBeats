# netlify/functions/spotify-search/spotify-search.py
import sys
import os
import json

# Add the deps directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, "deps"))

# Now import your dependencies
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def handler(event, context):
    """
    Netlify Function handler for Spotify search
    """
    try:
        # Parse the request body
        body = json.loads(event['body']) if event.get('body') else {}
        query = body.get('query', '')
        
        if not query:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing search query'})
            }
        
        # Here you would implement the Spotify search logic
        # For example, fetch from Spotify API using requests
        
        # For now, return a mock response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'data': {
                    'tracks': [
                        {'id': '1', 'name': 'Example Track 1', 'artist': 'Artist 1'},
                        {'id': '2', 'name': 'Example Track 2', 'artist': 'Artist 2'}
                    ]
                }
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
