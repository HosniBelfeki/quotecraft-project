@echo off
REM QuoteCraft Docker Startup Script
REM This script starts the application using Docker Compose

echo ========================================
echo QuoteCraft Docker Environment
echo ========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker version:
docker --version
echo.

REM Check if Docker is running
docker ps >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Starting QuoteCraft with Docker Compose...
echo.

REM Build and start containers
docker-compose up --build

echo.
echo ========================================
echo QuoteCraft Docker containers stopped
echo ========================================
echo.
pause
