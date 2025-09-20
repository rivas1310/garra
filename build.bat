@echo off
echo ===============================================
echo  CREANDO INSTALADOR DE GARRAS FELINAS ADMIN
echo ===============================================
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias primero...
    call npm install
)

echo.
echo Creando instalador para Windows...
call npm run build:win

echo.
if exist "dist\*.exe" (
    echo ===============================================
    echo  INSTALADOR CREADO EXITOSAMENTE
    echo ===============================================
    echo.
    echo El instalador se encuentra en la carpeta 'dist'
    echo Busca el archivo .exe para instalar la aplicacion
    echo.
    explorer dist
) else (
    echo ===============================================
    echo  ERROR AL CREAR EL INSTALADOR
    echo ===============================================
    echo Revisa los mensajes de error anteriores
)

pause
