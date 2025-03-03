# netlify/functions/songs-add/songs-add.py
import sys
import os
import json
import uuid

# Add the deps directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, "deps"))

# Now import your dependencies
import requests
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")

def handler(event, context):
    """
    Netlify Function handler for adding songs to a queue
    """
    try:
        if not supabase:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Supabase client not initialized'})
            }
        
        # Parse the request body
        body = json.loads(event['body']) if event.get('body') else {}
        queue_id = body.get('queueId', '')
        song_id = body.get('songId', '')
        user_id = body.get('userId', '')
        
        if not queue_id or not song_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required parameters'})
            }
        
        # Validate queue_id is a valid UUID
        try:
            uuid.UUID(queue_id)
        except ValueError:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid queue ID format'})
            }
        
        # Here you would implement the song addition logic
        # For example, insert into Supabase
        
        # For now, return a mock success response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'data': {
                    'id': str(uuid.uuid4()),
                    'queueId': queue_id,
                    'songId': song_id,
                    'createdAt': '2025-03-03T22:00:00Z'
                }
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
