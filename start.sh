#!/bin/bash

echo "Starting SwatchX Full-Stack Application..."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
if ! command_exists python3; then
    echo "❌ Error: python3 is not installed or not in PATH"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Error: npm is not installed or not in PATH"
    exit 1
fi

# Start backend in background
echo "[1/2] Starting FastAPI Backend Server..."
cd backend
python3 -m uvicorn app.main:app --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "[2/2] Starting React Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ SwatchX application is starting!"
echo ""
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:5173 (or next available port)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for background processes
wait
