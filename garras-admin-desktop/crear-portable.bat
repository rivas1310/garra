@echo off
echo ===============================================
echo  CREANDO VERSION PORTABLE
echo ===============================================
echo.

if not exist "dist\Garras Felinas Admin-win32-x64" (
    echo Creando aplicacion empaquetada...
    call npm run package:win
    echo.
)

echo Comprimiendo aplicacion...
powershell -command "Compress-Archive -Path 'dist\Garras Felinas Admin-win32-x64\*' -DestinationPath 'dist\GarrasFelinas-Admin-Portable.zip' -Force"

if exist "dist\GarrasFelinas-Admin-Portable.zip" (
    echo ===============================================
    echo  VERSION PORTABLE CREADA EXITOSAMENTE
    echo ===============================================
    echo.
    echo Archivo: dist\GarrasFelinas-Admin-Portable.zip
    echo.
    echo INSTRUCCIONES:
    echo 1. Descomprime el archivo ZIP
    echo 2. Ejecuta "Garras Felinas Admin.exe"
    echo 3. La aplicacion se conectara automaticamente
    echo.
    explorer dist
) else (
    echo ===============================================
    echo  ERROR AL CREAR VERSION PORTABLE
    echo ===============================================
)

pause
