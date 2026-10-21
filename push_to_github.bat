@echo off
echo ========================================================
echo Pushing CYBERINTEL AI Platform to GitHub
echo Repository: https://github.com/ajaymanikandanoff/threadintelligenceplatform.git
echo ========================================================
cd /d "%~dp0"
git remote set-url origin https://github.com/ajaymanikandanoff/threadintelligenceplatform.git
git branch -M main
git push -u origin main
echo.
echo ========================================================
echo Done! If you see any authentication prompt, sign in with your GitHub account or Personal Access Token.
echo ========================================================
pause
