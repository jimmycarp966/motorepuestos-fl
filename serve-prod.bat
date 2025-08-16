@echo off
echo Sirviendo aplicación compilada en modo producción...
echo.

REM Verificar si la carpeta dist existe
if not exist "dist" (
    echo Error: La carpeta dist no existe. Ejecuta build-prod.bat primero.
    pause
    exit /b 1
)

REM Verificar si serve está instalado
serve --version >nul 2>&1
if errorlevel 1 (
    echo Instalando serve globalmente...
    npm install -g serve
    if errorlevel 1 (
        echo Error: No se pudo instalar serve
        pause
        exit /b 1
    )
)

echo Sirviendo aplicación en http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

serve -s dist -l 3000
