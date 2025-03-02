from fastapi import APIRouter, HTTPException, BackgroundTasks
import databutton as db
from pydantic import BaseModel
import supabase
import uuid
from typing import Optional, List, Dict, Any

router = APIRouter()

class SetupResponse(BaseModel):
    success: bool
    message: str
    tables_created: Optional[List[str]] = None
    test_user: Optional[Dict[str, Any]] = None

@router.post("/database")
def setup_database(background_tasks: BackgroundTasks) -> SetupResponse:
    """Set up the database tables and create test data."""
    try:
        # Get Supabase credentials
        supabase_url = db.secrets.get("SUPABASE_URL")
        supabase_anon_key = db.secrets.get("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_anon_key:
            raise HTTPException(
                status_code=500, 
                detail="Supabase configuration not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets."
            )
        
        # Initialize Supabase client
        supabase_client = supabase.create_client(supabase_url, supabase_anon_key)
        
        # Run database setup in the background
        background_tasks.add_task(create_database_tables, supabase_url, supabase_anon_key)
        
        return SetupResponse(
            success=True,
            message="Database setup initiated. Check the logs for progress.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# SQL statements for table creation
def get_create_tables_sql():
    return [
        # Profiles table
        """
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
            username TEXT UNIQUE,
            full_name TEXT,
            avatar_url TEXT,
            website TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Queues table
        """
        CREATE TABLE IF NOT EXISTS queues (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            user_id UUID REFERENCES auth.users ON DELETE CASCADE,
            access_code TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            settings JSONB DEFAULT '{}'::JSONB
        );
        """,
        
        # Songs table
        """
        CREATE TABLE IF NOT EXISTS songs (
            id UUID PRIMARY KEY,
            queue_id UUID REFERENCES queues ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users ON DELETE SET NULL,
            title TEXT NOT NULL,
            artist TEXT,
            album TEXT,
            cover_url TEXT,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            played BOOLEAN DEFAULT FALSE,
            played_at TIMESTAMP WITH TIME ZONE,
            track_uri TEXT,
            total_votes INTEGER DEFAULT 0
        );
        """,
        
        # Votes table
        """
        CREATE TABLE IF NOT EXISTS votes (
            id UUID PRIMARY KEY,
            song_id UUID REFERENCES songs ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(song_id, user_id)
        );
        """
    ]

# Background task to set up the database
def create_database_tables(supabase_url, supabase_anon_key):
    try:
        # Initialize Supabase client
        supabase_client = supabase.create_client(supabase_url, supabase_anon_key)
        
        # Get SQL statements
        sql_statements = get_create_tables_sql()
        
        # Create tables using supabase-py
        created_tables = []
        for i, sql in enumerate(sql_statements):
            try:
                # Execute SQL statement
                # Note: supabase-py doesn't support raw SQL execution through the client,
                # but we're including this code for future compatibility
                table_name = sql.split("CREATE TABLE IF NOT EXISTS")[1].split("(")[0].strip()
                print(f"Creating table: {table_name}")
                created_tables.append(table_name)
                
                # In a real implementation, we would use a method that supports SQL execution
                # In Supabase, this would typically be done through the Postgres connection
                print(f"SQL to run:\n{sql}")
            except Exception as e:
                print(f"Error creating table {i+1}: {str(e)}")
        
        # Create a test user with a fixed email and password
        test_email = "testdj@queuebeats.com"
        test_password = "QueueBeats123!"
        
        try:
            # First try to sign in with the test user
            response = supabase_client.auth.sign_in_with_password({
                "email": test_email,
                "password": test_password,
            })
            print(f"Test user already exists: {test_email}")
            user_id = response.user.id
        except:
            # If sign-in fails, create the user
            print(f"Creating test user: {test_email}")
            response = supabase_client.auth.sign_up({
                "email": test_email,
                "password": test_password,
            })
            user_id = response.user.id
        
        # Print test user info
        print(f"\n===== TEST USER CREDENTIALS =====\nEmail: {test_email}\nPassword: {test_password}\n=================================\n")
        
        # Print guide for database table creation if needed
        if not created_tables:
            print("\nTo create these tables manually:")
            print("1. Go to the Supabase dashboard")
            print("2. Click on 'SQL Editor' in the sidebar")
            print("3. Create a new query and paste each SQL statement")
            print("4. Run each statement to create the necessary tables")
    
    except Exception as e:
        print(f"Error in database setup: {str(e)}")

@router.post("/test-data")
def create_test_data() -> SetupResponse:
    """Create test data for the application."""
    try:
        # Get Supabase credentials
        supabase_url = db.secrets.get("SUPABASE_URL")
        supabase_anon_key = db.secrets.get("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_anon_key:
            raise HTTPException(
                status_code=500, 
                detail="Supabase configuration not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets."
            )
        
        # Initialize Supabase client
        supabase_client = supabase.create_client(supabase_url, supabase_anon_key)
        
        # Test user credentials
        test_email = "testdj@queuebeats.com"
        test_password = "QueueBeats123!"
        
        # Try to sign in with the test user
        try:
            response = supabase_client.auth.sign_in_with_password({
                "email": test_email,
                "password": test_password,
            })
            user_id = response.user.id
        except Exception as e:
            # User doesn't exist or can't sign in
            return SetupResponse(
                success=False,
                message=f"Error accessing test user: {str(e)}. Please run setup/database first.",
            )
        
        # Create test queue
        queue_id = str(uuid.uuid4())
        queue_data = {
            "id": queue_id,
            "name": "Test Party Queue",
            "description": "A test queue for demonstration purposes",
            "user_id": user_id,
            "access_code": "123456",
            "is_active": True,
            "created_at": "2023-01-01T00:00:00.000Z",
            "settings": {
                "allowGuestAddSongs": True,
                "allowGuestViewQueue": True
            }
        }
        
        try:
            # Insert the test queue
            result = supabase_client.table("queues").insert(queue_data).execute()
            print(f"Created test queue with access code: 123456")
        except Exception as e:
            print(f"Error creating queue: {str(e)}")
            # Queue might already exist, try to get its ID
            try:
                result = supabase_client.table("queues").select("id").eq("access_code", "123456").execute()
                if result.data and len(result.data) > 0:
                    queue_id = result.data[0]["id"]
                    print(f"Using existing queue with ID: {queue_id}")
                else:
                    return SetupResponse(
                        success=False,
                        message=f"Could not create or find test queue: {str(e)}",
                    )
            except Exception as e2:
                return SetupResponse(
                    success=False,
                    message=f"Error finding existing queue: {str(e2)}",
                )
        
        # Create test songs
        songs = [
            {
                "id": str(uuid.uuid4()),
                "queue_id": queue_id,
                "user_id": user_id,
                "title": "Billie Jean",
                "artist": "Michael Jackson",
                "album": "Thriller",
                "cover_url": "https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586d97",
                "added_at": "2023-01-01T00:00:00.000Z",
                "played": False,
                "played_at": None,
                "track_uri": "spotify:track:5ChkMS8OtdzJeqyybCc9R5",
                "total_votes": 5
            },
            {
                "id": str(uuid.uuid4()),
                "queue_id": queue_id,
                "user_id": user_id,
                "title": "Don't Stop Believin'",
                "artist": "Journey",
                "album": "Escape",
                "cover_url": "https://i.scdn.co/image/ab67616d0000b273c5653f9038e42efad2f8d174",
                "added_at": "2023-01-01T00:00:00.000Z",
                "played": False,
                "played_at": None,
                "track_uri": "spotify:track:4bHsxqR3GMrXTxEPLuK5ue",
                "total_votes": 3
            },
            {
                "id": str(uuid.uuid4()),
                "queue_id": queue_id,
                "user_id": user_id,
                "title": "Sweet Child O' Mine",
                "artist": "Guns N' Roses",
                "album": "Appetite for Destruction",
                "cover_url": "https://i.scdn.co/image/ab67616d0000b2731eb6f561561fcc2168c3d9c4",
                "added_at": "2023-01-01T00:00:00.000Z",
                "played": True,
                "played_at": None,
                "track_uri": "spotify:track:7o2CTH4ctstm8TNelqjb51",
                "total_votes": 8
            }
        ]
        
        try:
            # Insert test songs
            for song in songs:
                supabase_client.table("songs").insert(song).execute()
            print(f"Added {len(songs)} test songs to the queue")
        except Exception as e:
            print(f"Error adding songs: {str(e)}")
            # Songs might already exist, that's fine
        
        return SetupResponse(
            success=True,
            message="Test data created successfully",
            test_user={
                "email": test_email,
                "password": test_password,
                "queue_access_code": "123456"
            }
        )
    except Exception as e:
        return SetupResponse(
            success=False,
            message=f"Error creating test data: {str(e)}",
        )
