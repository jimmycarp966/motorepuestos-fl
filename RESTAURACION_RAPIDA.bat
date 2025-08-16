@echo off
echo ========================================
echo    SISTEMA DE RESTAURACION RAPIDA
echo ========================================
echo.

echo [1/5] Deteniendo servidor de desarrollo...
taskkill /f /im node.exe 2>nul
echo ✓ Servidor detenido

echo.
echo [2/5] Restaurando al punto funcional...
git checkout PUNTO_RESTAURACION_FUNCIONAL_ACTUAL
if %errorlevel% neq 0 (
    echo ❌ Error: No se pudo restaurar al punto funcional
    echo Verificando tags disponibles...
    git tag -l "*RESTAURACION*"
    pause
    exit /b 1
)
echo ✓ Restauración completada

echo.
echo [3/5] Limpiando dependencias...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo ✓ Dependencias limpiadas

echo.
echo [4/5] Reinstalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error: No se pudieron instalar las dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [5/5] Iniciando servidor de desarrollo...
echo.
echo ========================================
echo    RESTAURACION COMPLETADA
echo ========================================
echo.
echo ✅ El proyecto ha sido restaurado al estado funcional
echo ✅ Iniciando servidor en http://localhost:5173
echo.
echo Para verificar funcionalidad:
echo 1. Abrir http://localhost:5173
echo 2. Hacer login con cualquier usuario
echo 3. Navegar entre módulos
echo 4. Verificar dashboard
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev
