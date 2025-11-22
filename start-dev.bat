@echo off
REM QuoteCraft Development Startup Script
REM This script starts both backend and frontend in development mode

echo ========================================
echo QuoteCraft Development Environment
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Start Backend
echo Starting Backend Server...
start "QuoteCraft Backend" cmd /k "cd quotecraft-backend && npm run dev"
timeout /t 3 >nul

REM Start Frontend
echo Starting Frontend Server...
start "QuoteCraft Frontend" cmd /k "cd QuoteCraft-frontend && npm run dev"

echo.
echo ========================================
echo QuoteCraft is starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo Health:   http://localhost:3001/health
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo To stop the servers, close the terminal windows.
echo.
