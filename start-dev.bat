@echo off
echo Iniciando servidor de desarrollo en puerto 3000...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo Error: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

REM Crear archivo .env si no existe
if not exist ".env" (
    echo Creando archivo .env...
    echo # Supabase Configuration > .env
    echo VITE_SUPABASE_URL=https://hsajhnxtlgfpkpzcrjyb.supabase.co >> .env
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4 >> .env
    echo. >> .env
    echo # App Configuration >> .env
    echo VITE_APP_NAME=Motorepuestos FL >> .env
    echo VITE_APP_VERSION=1.0.0 >> .env
    echo VITE_APP_ENV=development >> .env
)

echo Iniciando servidor de desarrollo...
echo La aplicación estará disponible en: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev
