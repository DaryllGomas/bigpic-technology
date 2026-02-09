@echo off
echo ========================================
echo  Big Pic Solutions - Invoicing System
echo ========================================
echo.
echo Starting the invoicing system...
echo.

cd /d "%~dp0"

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo No virtual environment found. Using system Python...
)

echo.
echo Starting Flask server...
echo.

REM Start Flask in background and wait a moment for it to start
start /B python app.py

REM Wait 3 seconds for server to start
timeout /t 3 /nobreak >nul

REM Open browser
echo Opening browser at http://localhost:5000
start http://localhost:5000

echo.
echo ========================================
echo Server is running!
echo Press any key to stop the server...
echo ========================================
pause >nul

REM Kill the Python process when user presses a key
taskkill /F /IM python.exe /FI "WINDOWTITLE eq start-and-open.bat*" >nul 2>&1
