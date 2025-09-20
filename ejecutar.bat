@echo off
echo ===============================================
echo  EJECUTANDO GARRAS FELINAS ADMIN DESKTOP
echo ===============================================
echo.

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Iniciando aplicacion...
echo.
echo NOTA: La aplicacion intentara conectarse a:
echo   1. http://localhost:3000/admin (desarrollo)
echo   2. https://www.garrasfelinas.com/admin (produccion)
echo.
echo Asegurate de que tu servidor Next.js este ejecutandose
echo en localhost:3000 para usar la version de desarrollo.
echo.

call npm start
