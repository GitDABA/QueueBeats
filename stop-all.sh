#!/bin/bash

# QueueBeats - Script to stop both frontend and backend servers

if [ -f .server_pids ]; then
    read FRONTEND_PID BACKEND_PID < .server_pids
    
    echo "Stopping frontend server (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || echo "Frontend server was not running"
    
    echo "Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || echo "Backend server was not running"
    
    rm .server_pids
    echo "All servers stopped."
else
    echo "No running servers found."
fi
