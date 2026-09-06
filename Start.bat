@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   STARTING AYUSH ACADEMIA-INDUSTRY COLLABORATION PLATFORM
echo ============================================================
echo.

cd /d "%~dp0"

:: 1. Validate environment
if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found!
    echo Please run Setup.bat first to set up all dependencies.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo [ERROR] Frontend directory not found!
    echo Please run Setup.bat first.
    pause
    exit /b 1
)

:: 2. Ensure environment configuration exists
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo Creating backend\.env from template...
        copy "backend\.env.example" "backend\.env" >nul
    )
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        echo Creating frontend\.env from template...
        copy "frontend\.env.example" "frontend\.env" >nul
    )
)

:: 3. Automatically free ports 8000 & 3000 from any dangling processes
echo [1/4] Checking and freeing server ports 8000 and 3000...
call "%~dp0Stop.bat" /nopause >nul 2>&1

:: 4. Launch Backend in separate window
echo [2/4] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "AYUSH FastAPI Backend" cmd /k "cd /d ""%~dp0backend"" && title AYUSH FastAPI Backend && "".venv\Scripts\python.exe"" -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1"

:: 5. Launch Frontend in separate window
echo [3/4] Launching Next.js Frontend on http://localhost:3000 ...
start "AYUSH Next.js Frontend" cmd /k "cd /d ""%~dp0frontend"" && title AYUSH Next.js Frontend && npm run dev"

:: 6. Wait for server readiness and launch browser
echo [4/4] Waiting for servers to initialize...
powershell -NoProfile -Command "Start-Sleep -Seconds 4" >nul 2>&1

echo Opening AYUSH Platform in default browser (http://localhost:3000)...
start http://localhost:3000

echo.
echo ============================================================
echo   AYUSH PLATFORM IS NOW RUNNING!
echo ============================================================
echo.
echo   Frontend Portal: http://localhost:3000
echo   Backend API:     http://127.0.0.1:8000
echo   API Interactive: http://127.0.0.1:8000/docs
echo.
echo   To stop all servers cleanly, run: Stop.bat
echo.
pause
