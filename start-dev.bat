@echo off
echo Iniciando servidor de desarrollo...

REM Agregar Node.js al PATH
set PATH=C:\Program Files\nodejs;%PATH%

REM Verificar si Node.js está disponible
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js no encontrado en C:\Program Files\nodejs\
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está disponible
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm no encontrado
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo Error instalando dependencias
        pause
        exit /b 1
    )
)

REM Iniciar servidor de desarrollo
echo Iniciando servidor en http://localhost:3000...
npm run dev

pause
