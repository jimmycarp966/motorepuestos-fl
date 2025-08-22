@echo off
echo ================================================
echo PRUEBA DE CREACIÓN DE VENTAS
echo ================================================
echo.
echo Este script creará una venta de prueba y verificará
echo las fechas y horas que se registran en la base de datos.
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo Ejecutando prueba de creación de ventas...
echo.

REM Ejecutar la prueba de creación de ventas
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f database/verification/probar-creacion-ventas.sql

echo.
echo ================================================
echo PRUEBA COMPLETADA
echo ================================================
echo.
echo Revisa los resultados arriba para ver:
echo - Estado actual de las ventas
echo - Venta de prueba creada
echo - Fechas y horas registradas
echo - Movimiento de caja generado
echo - Comparación de fechas
echo - Configuración de timezone
echo.
pause


