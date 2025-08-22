@echo off
echo ================================================
echo INVESTIGACIÓN: MOVIMIENTO DE CAJA NO CREADO
echo ================================================
echo.
echo Investigando por qué no se crea automáticamente
echo el movimiento de caja cuando se crea una venta...
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Ejecutando investigación...
echo.

REM Ejecutar la investigación
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f database/verification/investigar-movimiento-caja.sql

echo.
echo ================================================
echo INVESTIGACIÓN COMPLETADA
echo ================================================
echo.
echo Revisa los resultados arriba para identificar:
echo - Si existen triggers para crear movimientos
echo - Si existen funciones relacionadas
echo - Si hay errores al crear movimientos manualmente
echo - La estructura de la tabla movimientos_caja
echo.
pause


