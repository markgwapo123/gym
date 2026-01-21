@echo off
echo ===============================================
echo    Gym Management System - Setup Check
echo ===============================================
echo.

echo Checking MongoDB...
sc query MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB service found
    sc query MongoDB | findstr "RUNNING" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] MongoDB is running
    ) else (
        echo [!] MongoDB is not running
        echo Starting MongoDB...
        net start MongoDB
    )
) else (
    echo [!] MongoDB not installed
    echo.
    echo Please install MongoDB or use MongoDB Atlas
    echo Download: https://www.mongodb.com/try/download/community
    echo.
)

echo.
echo ===============================================
echo To start the application:
echo ===============================================
echo.
echo 1. Open PowerShell Terminal 1 - Backend:
echo    cd d:\boygym\backend
echo    node server.js
echo.
echo 2. Open PowerShell Terminal 2 - Frontend:
echo    cd d:\boygym\frontend
echo    npm start
echo.
echo 3. Open PowerShell Terminal 3 - Create Admin:
echo    cd d:\boygym\backend
echo    node createAdmin.js
echo.
echo 4. Open browser: http://localhost:3000
echo    Username: admin
echo    Password: admin123
echo.
pause
