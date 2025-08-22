@echo off
echo ================================================
echo FIX PARA TABLA MOVIMIENTOS_CAJA
echo ================================================
echo.
echo Este script resolvera el error al eliminar movimientos de caja
echo agregando las columnas estado y updated_at que faltan.
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Ejecutando script de fix...
echo.

REM Ejecutar el script SQL usando psql (ajusta la conexión según tu configuración)
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f database/fixes/fix-movimientos-caja-simple.sql

echo.
echo ================================================
echo FIX COMPLETADO
echo ================================================
echo.
echo Si no hay errores, el problema deberia estar resuelto.
echo Ahora puedes eliminar movimientos de caja sin problemas.
echo.
pause
