@echo off
title AI ThreatLens Launcher
cls
color 0B
echo ================================================================
echo           AI THREATLENS - ONE-CLICK PLATFORM LAUNCHER           
echo ================================================================
echo.
echo [1/3] Launching FastAPI Backend on Port 8000...
start "AI ThreatLens - Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Launching React Vite Frontend on Port 5173...
start "AI ThreatLens - Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && call npm.cmd run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening AI ThreatLens in your default browser...
start http://localhost:5173

echo.
echo ================================================================
echo   SUCCESS! AI ThreatLens is now running:
echo   - Frontend UI:  http://localhost:5173
echo   - Backend API:  http://localhost:8000
echo   - API Swagger:  http://localhost:8000/docs
echo.
echo   To STOP both servers anytime, run: stop_all.bat
echo ================================================================
echo.
pause
