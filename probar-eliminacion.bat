@echo off
echo ================================================
echo PRUEBA DE ELIMINACIÓN DE MOVIMIENTOS
echo ================================================
echo.
echo Probando que la funcionalidad de eliminación funciona correctamente...
echo.

REM Ejecutar prueba de eliminación
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f database/verification/probar-eliminacion-movimiento.sql

echo.
echo ================================================
echo PRUEBA COMPLETADA
echo ================================================
echo.
echo Si ves "SISTEMA LISTO PARA ELIMINAR MOVIMIENTOS" en el resumen,
echo entonces el fix está funcionando correctamente.
echo.
echo Ahora puedes probar eliminar un movimiento desde la aplicación.
echo.
pause
