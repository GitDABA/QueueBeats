#!/bin/bash

# QueueBeats - Script to start both frontend and backend servers
# This script starts both servers in the background and displays their logs

# Load environment variables
source .env

# Set default ports if not defined in .env
FRONTEND_PORT=${FRONTEND_PORT:-5173}
BACKEND_PORT=${BACKEND_PORT:-8001}

echo "Starting QueueBeats application..."
echo "Frontend will be available at: http://localhost:$FRONTEND_PORT"
echo "Backend will be available at: http://localhost:$BACKEND_PORT"

# Function to check if a port is in use
check_port() {
    if lsof -i :$1 > /dev/null ; then
        echo "Error: Port $1 is already in use. Please close the application using this port or change the port in .env file."
        return 1
    fi
    return 0
}

# Check if ports are available
check_port $FRONTEND_PORT || exit 1
check_port $BACKEND_PORT || exit 1

# Create logs directory if it doesn't exist
mkdir -p logs

# Start backend server
echo "Starting backend server..."
cd backend && ./run.sh > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Start frontend server
echo "Starting frontend server..."
cd frontend && ./run.sh > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

# Save PIDs to file for later shutdown
echo "$FRONTEND_PID $BACKEND_PID" > .server_pids

echo "Both servers are now running in the background."
echo "To view logs:"
echo "  Frontend: tail -f logs/frontend.log"
echo "  Backend: tail -f logs/backend.log"
echo ""
echo "To stop servers, run: ./stop-all.sh"

# Create stop script if it doesn't exist
if [ ! -f "stop-all.sh" ]; then
    cat > stop-all.sh << 'EOF'
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
EOF
    chmod +x stop-all.sh
    echo "Created stop-all.sh script to stop the servers."
fi
