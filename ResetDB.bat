@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   AYUSH PLATFORM - DATABASE RESET & CANONICAL RESEED
echo ============================================================
echo.

cd /d "%~dp0"

if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found!
    echo Please run Setup.bat first.
    pause
    exit /b 1
)

echo Resetting database schema and reseeding canonical data...
echo (All hardcoded assessment questions removed; dynamic AI assessment active)
echo.

backend\.venv\Scripts\python.exe backend\reset_db.py
if %errorlevel% neq 0 (
    echo [ERROR] Failed to reset database.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   DATABASE SUCCESSFULLY RESET AND RESEEDED!
echo ============================================================
echo.
pause
