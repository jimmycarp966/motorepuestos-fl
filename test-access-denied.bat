@echo off
echo ========================================
echo   PRUEBA SISTEMA DE BLOQUEO
echo ========================================
echo.

echo 🔒 Probando sistema de bloqueo de acceso...
echo.

node scripts/test-access-denied.js

echo.
echo ========================================
echo   PRUEBA COMPLETADA
echo ========================================
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
