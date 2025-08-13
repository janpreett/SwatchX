@echo off
echo Starting SwatchX Full-Stack Application...
echo.

REM Start backend in a new window
echo [1/2] Starting FastAPI Backend Server...
start "SwatchX Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --reload"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in a new window  
echo [2/2] Starting React Frontend Server...
start "SwatchX Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ✅ SwatchX application is starting!
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173 (or next available port)
echo.
echo Press any key to exit this launcher...
pause > nul
