@echo off
echo ================================================
echo RESTAURAR STOCK DE VENTAS ELIMINADAS
echo ================================================
echo.

echo 🔧 Ejecutando script SQL para restaurar stock...
echo.

REM Ejecutar el script SQL
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f "database/fixes/restaurar-stock-venta-eliminada.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Script ejecutado correctamente
    echo.
    echo 📋 Funcionalidades implementadas:
    echo   1. ✅ Función restaurar_stock_venta_eliminada()
    echo   2. ✅ Trigger automático para restaurar stock
    echo   3. ✅ Log de auditoría para trazabilidad
    echo   4. ✅ Manejo de errores individuales
    echo.
    echo 🎯 Ahora cuando elimines una venta:
    echo    - Se marcará como eliminada
    echo    - El stock se restaurará automáticamente
    echo    - Se registrará en el log de auditoría
    echo    - La UI se actualizará automáticamente
    echo.
) else (
    echo.
    echo ❌ Error al ejecutar el script
    echo.
    echo 💡 Asegúrate de:
    echo   1. Tener las credenciales de Supabase configuradas
    echo   2. Tener acceso a la base de datos
    echo   3. Que el archivo SQL existe en la ruta correcta
    echo.
)

pause
