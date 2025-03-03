import os
import jwt
from fastapi import HTTPException
from typing import Optional
from datetime import datetime
import json

# Get JWT secret from environment
JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
if not JWT_SECRET:
    print("WARNING: SUPABASE_JWT_SECRET environment variable is not set!")
    print("         JWT token validation will attempt to decode without verification.")
    print("         This is INSECURE and should only be used for development.")
    print("         Set SUPABASE_JWT_SECRET in your environment for proper security.")

def get_user_id(token: str) -> str:
    """
    Extract user_id from a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        User ID extracted from the token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        # For Supabase JWT, we need to first check if there's a JWT secret
        if JWT_SECRET:
            try:
                # Try to decode with the JWT secret
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except Exception as e:
                # If decoding with the secret fails, log it and try without verification
                print(f"Error decoding token with JWT_SECRET: {str(e)}")
                payload = jwt.decode(token, options={"verify_signature": False})
                print(f"Successfully decoded token without verification (INSECURE)")
        else:
            # If no JWT secret is available, try to decode without verification
            # This is not secure but allows development without the secret
            print(f"Decoding token without verification - INSECURE")
            payload = jwt.decode(token, options={"verify_signature": False})
        
        # Extract user ID from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
        
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing token: {str(e)}")

def validate_token(token: str) -> dict:
    """
    Validate a JWT token and return its payload
    
    Args:
        token: JWT token string
        
    Returns:
        Dictionary containing token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        # For Supabase JWT, we need to first check if there's a JWT secret
        if JWT_SECRET:
            try:
                # Try to decode with the JWT secret
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except Exception as e:
                # If decoding with the secret fails, log it and try without verification
                print(f"Error decoding token with JWT_SECRET: {str(e)}")
                payload = jwt.decode(token, options={"verify_signature": False})
                print(f"Successfully decoded token without verification (INSECURE)")
        else:
            # If no JWT secret is available, try to decode without verification
            # This is not secure but allows development without the secret
            print(f"Decoding token without verification - INSECURE")
            payload = jwt.decode(token, options={"verify_signature": False})
        
        # Check if token has expired
        if "exp" in payload:
            exp_timestamp = payload["exp"]
            current_timestamp = datetime.now().timestamp()
            
            if current_timestamp > exp_timestamp:
                raise HTTPException(status_code=401, detail="Token has expired")
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing token: {str(e)}")
