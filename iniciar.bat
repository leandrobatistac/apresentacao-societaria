@echo off
echo.
echo  Iniciando Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo  Iniciando Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo  Aguardando frontend subir...
timeout /t 5 /nobreak > nul

echo  Abrindo Chrome...
start chrome http://localhost:5173

exit
