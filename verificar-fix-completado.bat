@echo off
echo ================================================
echo VERIFICACIÓN FINAL DEL FIX
echo ================================================
echo.
echo Verificando que el fix de movimientos_caja esté completamente funcional...
echo.

REM Ejecutar verificación completa
psql -h db.supabase.co -p 5432 -d postgres -U postgres -f database/verification/verificar-movimientos-caja.sql

echo.
echo ================================================
echo VERIFICACIÓN COMPLETADA
echo ================================================
echo.
echo Si ves ✅ en todas las verificaciones, el problema está resuelto.
echo.
echo Ahora puedes:
echo - Eliminar movimientos de caja sin errores
echo - Los movimientos se marcarán como 'eliminada' en lugar de borrarse
echo - Se registrará automáticamente la fecha de actualización
echo.
pause
