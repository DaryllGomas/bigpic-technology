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
echo The app will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the Flask app
python app.py

pause
