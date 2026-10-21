@echo off
echo ========================================================
echo Starting AI Threat Intel Backend (FastAPI on Port 8000)
echo ========================================================
cd /d "%~dp0\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
