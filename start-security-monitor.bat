@echo off
echo Iniciando Monitor de Seguridad...
cd /d "%~dp0"
node scripts/security-monitor.js
pause
