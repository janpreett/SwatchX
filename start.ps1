# SwatchX Application Launcher (PowerShell)
Write-Host "Starting SwatchX Full-Stack Application..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to check if a command exists
function Test-Command($Command) {
    try {
        if (Get-Command $Command -ErrorAction Stop) { return $true }
    }
    catch { return $false }
}

# Check for required commands
if (-not (Test-Command "python")) {
    Write-Host "❌ Error: python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ Error: npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Starting FastAPI Backend Server..." -ForegroundColor Yellow

# Start backend in new PowerShell window
$BackendPath = Join-Path $ScriptDir "backend"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; python -m uvicorn app.main:app --reload"

# Wait for backend to start
Start-Sleep -Seconds 3

Write-Host "[2/2] Starting React Frontend Server..." -ForegroundColor Yellow

# Start frontend in new PowerShell window  
$FrontendPath = Join-Path $ScriptDir "frontend"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm run dev"

Write-Host ""
Write-Host "✅ SwatchX application is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173 (or next available port)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both servers are running in separate windows."
Write-Host "Close those windows to stop the servers."
Write-Host ""
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
