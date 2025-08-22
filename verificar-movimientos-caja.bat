@echo off
echo ================================================
echo VERIFICACIÓN DE TABLA MOVIMIENTOS_CAJA
echo ================================================
echo.
echo Este script verificara si la tabla movimientos_caja
echo tiene todas las columnas necesarias para funcionar correctamente.
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Ejecutando verificación...
echo.

REM Ejecutar el script de verificación usando psql (ajusta la conexión según tu configuración)
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f database/verification/verificar-movimientos-caja.sql

echo.
echo ================================================
echo VERIFICACIÓN COMPLETADA
echo ================================================
echo.
echo Revisa los resultados arriba:
echo - Si ves ✅ en todas las verificaciones, todo está bien
echo - Si ves ❌ en alguna verificación, ejecuta fix-movimientos-caja.bat
echo.
pause
