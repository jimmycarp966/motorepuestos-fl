@echo off
echo Configurando Node.js en el PATH del sistema...

REM Verificar si Node.js está instalado
if not exist "C:\Program Files\nodejs\node.exe" (
    echo Error: Node.js no encontrado en C:\Program Files\nodejs\
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Agregar Node.js al PATH del usuario
setx PATH "%PATH%;C:\Program Files\nodejs"

if errorlevel 1 (
    echo Error: No se pudo configurar el PATH
    echo Intentando con permisos de administrador...
    
    REM Intentar con permisos elevados
    powershell -Command "Start-Process cmd -ArgumentList '/c setx PATH \"%PATH%;C:\Program Files\nodejs\"' -Verb RunAs"
) else (
    echo Node.js agregado al PATH exitosamente
)

echo.
echo Configuracion completada!
echo Por favor, reinicia PowerShell/CMD para que los cambios tomen efecto
echo.
echo Para verificar, ejecuta:
echo   node --version
echo   npm --version
echo.
pause
