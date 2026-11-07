@echo off
title Stopping AI ThreatLens
cls
color 0C
echo ================================================================
echo              STOPPING AI THREATLENS SERVERS                     
echo ================================================================
echo.
echo Stopping Backend (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopping Frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo ================================================================
echo   All AI ThreatLens services stopped successfully!
echo ================================================================
echo.
timeout /t 2 /nobreak >nul
