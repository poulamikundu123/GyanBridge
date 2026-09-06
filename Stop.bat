@echo off
setlocal enabledelayedexpansion

set "NO_PAUSE=0"
if "%~1"=="/nopause" set "NO_PAUSE=1"
if "%~1"=="--no-pause" set "NO_PAUSE=1"

echo ============================================================
echo   STOPPING AYUSH PLATFORM SERVERS
echo ============================================================
echo.

:: 1. Terminate Terminal Windows by title
echo [1/3] Closing AYUSH terminal windows...
taskkill /FI "WINDOWTITLE eq AYUSH FastAPI Backend*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq AYUSH Next.js Frontend*" /F /T >nul 2>&1

:: 2. Free Port 8000 (FastAPI / Python)
echo [2/3] Stopping processes on Port 8000 (Backend)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: 3. Free Port 3000 (Next.js / Node)
echo [3/3] Stopping processes on Port 3000 (Frontend)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: Fallback netstat check in case PowerShell command missed any PIDs
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ============================================================
echo   ALL AYUSH SERVERS HAVE BEEN SUCCESSFULLY STOPPED!
echo ============================================================
echo.

if "%NO_PAUSE%"=="0" (
    pause
)
