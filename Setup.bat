@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   AYUSH PLATFORM - AUTOMATED SYSTEM SETUP & VERIFICATION
echo ============================================================
echo.

cd /d "%~dp0"

:: 1. Check Python installation
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do echo       Found: %%v

:: 2. Check Node.js and npm installation
echo [2/6] Checking Node.js and npm...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not added to PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo       Found Node.js: %%v
for /f "tokens=*" %%v in ('npm --version') do echo       Found npm: %%v

:: 3. Configure Environment Variables (.env)
echo.
echo [3/6] Configuring environment files (.env)...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo       Created backend\.env from template.
    )
) else (
    echo       backend\.env already exists.
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env" >nul
        echo       Created frontend\.env from template.
    )
) else (
    echo       frontend\.env already exists.
)

:: 4. Backend Setup
echo.
echo [4/6] Setting up FastAPI backend virtual environment ^& dependencies...
if not exist "backend\.venv\Scripts\python.exe" (
    echo       Creating Python virtual environment at backend\.venv...
    python -m venv backend\.venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

echo       Installing backend requirements from backend\requirements.txt...
backend\.venv\Scripts\python.exe -m pip install -q --upgrade pip
backend\.venv\Scripts\python.exe -m pip install -q -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)
echo       Backend dependencies installed successfully.

:: 5. Database Initialization & Seed
echo.
echo [5/6] Initializing clean database ^& seeding canonical AYUSH taxonomy...
backend\.venv\Scripts\python.exe backend\reset_db.py
if %errorlevel% neq 0 (
    echo [ERROR] Database initialization failed.
    pause
    exit /b 1
)

echo       Running comprehensive smoke test verification...
backend\.venv\Scripts\python.exe backend\test_smoke.py
if %errorlevel% neq 0 (
    echo [WARNING] Smoke test reported an issue, but continuing setup...
) else (
    echo       Backend and AI engine verified with 100%% success.
)

:: 6. Frontend Setup
echo.
echo [6/6] Setting up Next.js frontend dependencies...
if not exist "frontend\package.json" (
    echo [ERROR] frontend\package.json not found!
    pause
    exit /b 1
)

cd frontend
echo       Running npm install...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend npm packages.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================================
echo   SUCCESS: SETUP COMPLETED FOR AYUSH PLATFORM!
echo ============================================================
echo.
echo   You can now start the entire application by running:
echo     Start.bat
echo.
echo   To stop all servers at any time, run:
echo     Stop.bat
echo.
pause
