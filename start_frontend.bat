@echo off
echo ========================================================
echo Starting AI Threat Intel Frontend (React + Vite on Port 5173)
echo ========================================================
cd /d "%~dp0\frontend"
call npm.cmd run dev
pause
