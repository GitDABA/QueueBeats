"""
Enhanced error handling utilities for QueueBeats backend
Provides better diagnostics and logging for common error scenarios
"""

import os
import json
import sys
import traceback
import time
from typing import Dict, Any, Optional, Tuple
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.base import RequestResponseEndpoint
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logging
import logging
logger = logging.getLogger("queuebeats")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    logger.addHandler(handler)


class ErrorDetail:
    """Enhanced error details for better diagnostics"""
    def __init__(
        self, 
        code: str, 
        message: str, 
        request_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        suggestion: Optional[str] = None
    ):
        self.code = code
        self.message = message
        self.request_id = request_id
        self.details = details or {}
        self.suggestion = suggestion
        self.timestamp = time.time()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON response"""
        result = {
            "code": self.code,
            "message": self.message,
            "timestamp": self.timestamp
        }
        
        if self.request_id:
            result["request_id"] = self.request_id
            
        if self.details:
            result["details"] = self.details
            
        if self.suggestion:
            result["suggestion"] = self.suggestion
            
        return result


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware to capture and format errors consistently"""
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        try:
            # Generate a request ID for tracking
            request_id = f"req_{int(time.time()*1000)}"
            request.state.request_id = request_id
            
            # Process the request
            response = await call_next(request)
            return response
            
        except HTTPException as exc:
            # Handle FastAPI HTTP exceptions
            logger.warning(f"HTTP error {exc.status_code}: {exc.detail} (request_id: {request_id})")
            
            return JSONResponse(
                status_code=exc.status_code,
                content=ErrorDetail(
                    code=f"http_{exc.status_code}",
                    message=str(exc.detail),
                    request_id=request_id,
                    suggestion=get_suggestion_for_status(exc.status_code)
                ).to_dict()
            )
            
        except Exception as exc:
            # Handle unexpected exceptions
            logger.error(f"Unhandled error: {str(exc)} (request_id: {request_id})")
            logger.error(traceback.format_exc())
            
            return JSONResponse(
                status_code=500,
                content=ErrorDetail(
                    code="internal_server_error",
                    message="An unexpected error occurred",
                    request_id=request_id,
                    details={"error_type": type(exc).__name__},
                    suggestion="Check server logs for more details"
                ).to_dict()
            )


def get_suggestion_for_status(status_code: int) -> str:
    """Return helpful suggestions based on status code"""
    suggestions = {
        401: "Check your authentication token or try logging in again",
        403: "You don't have permission to access this resource",
        404: "The requested resource could not be found",
        409: "There was a conflict with the current state of the resource",
        422: "The request contains invalid parameters",
        429: "Too many requests, please try again later",
        500: "An internal server error occurred, please try again or contact support",
        501: "This feature is not yet implemented",
        503: "The service is temporarily unavailable, please try again later"
    }
    
    return suggestions.get(status_code, "Please check your request and try again")


def setup_error_handlers(app) -> None:
    """Configure error handling for a FastAPI app"""
    
    # Add error handling middleware
    app.add_middleware(ErrorHandlingMiddleware)
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        """Handle FastAPI HTTP exceptions"""
        request_id = getattr(request.state, "request_id", None) or f"req_{int(time.time()*1000)}"
        
        logger.warning(f"HTTP error {exc.status_code}: {exc.detail} (request_id: {request_id})")
        
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorDetail(
                code=f"http_{exc.status_code}",
                message=str(exc.detail),
                request_id=request_id,
                suggestion=get_suggestion_for_status(exc.status_code)
            ).to_dict()
        )
    
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle unexpected exceptions"""
        request_id = getattr(request.state, "request_id", None) or f"req_{int(time.time()*1000)}"
        
        logger.error(f"Unhandled error: {str(exc)} (request_id: {request_id})")
        logger.error(traceback.format_exc())
        
        return JSONResponse(
            status_code=500,
            content=ErrorDetail(
                code="internal_server_error",
                message="An unexpected error occurred",
                request_id=request_id,
                details={"error_type": type(exc).__name__},
                suggestion="Check server logs for more details"
            ).to_dict()
        )
