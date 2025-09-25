@echo off
echo ========================================
echo   Garras Felinas Admin - Ejecutor
echo ========================================
echo.

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo ERROR: Las dependencias no están instaladas.
    echo Ejecuta: npm install
    echo.
    pause
    exit /b 1
)

echo Iniciando Garras Felinas Admin...
echo.
echo La aplicación se abrirá en una nueva ventana.
echo Para cerrar la aplicación, cierra la ventana o presiona Ctrl+C
echo.

REM Ejecutar directamente con electron en modo desarrollo
npx electron . --dev

echo.
echo La aplicación se ha cerrado.
echo Presiona cualquier tecla para continuar...
pause >nul

