-- ================================================
-- PRUEBA DE ELIMINACIÓN DE MOVIMIENTOS
-- ================================================
-- Script para probar que la funcionalidad de eliminación funciona correctamente

-- Verificar estado actual de la tabla
SELECT 
    'ESTADO ACTUAL' as verificacion,
    COUNT(*) as total_movimientos,
    COUNT(CASE WHEN estado = 'activa' THEN 1 END) as activos,
    COUNT(CASE WHEN estado = 'eliminada' THEN 1 END) as eliminados,
    COUNT(CASE WHEN updated_at IS NOT NULL THEN 1 END) as con_updated_at
FROM movimientos_caja;

-- Mostrar algunos movimientos de ejemplo
SELECT 
    'EJEMPLOS DE MOVIMIENTOS' as verificacion,
    id,
    tipo,
    monto,
    concepto,
    estado,
    created_at,
    updated_at
FROM movimientos_caja 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar que las columnas necesarias existen
SELECT 
    'COLUMNAS REQUERIDAS' as verificacion,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('estado', 'updated_at') THEN '✅ CRÍTICA'
        ELSE 'ℹ️ ESTÁNDAR'
    END as importancia
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
    AND column_name IN ('estado', 'updated_at')
ORDER BY column_name;

-- Verificar trigger
SELECT 
    'TRIGGER DE UPDATED_AT' as verificacion,
    trigger_name,
    event_manipulation,
    CASE 
        WHEN trigger_name = 'update_movimientos_caja_updated_at' THEN '✅ FUNCIONANDO'
        ELSE '❌ PROBLEMA'
    END as estado
FROM information_schema.triggers 
WHERE event_object_table = 'movimientos_caja'
    AND trigger_name = 'update_movimientos_caja_updated_at';

-- Verificar función
SELECT 
    'FUNCIÓN UPDATE_UPDATED_AT' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado;

-- Resumen final
SELECT 
    'RESUMEN FINAL' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos_caja' AND column_name = 'estado')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos_caja' AND column_name = 'updated_at')
        AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column')
        AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table = 'movimientos_caja' AND trigger_name = 'update_movimientos_caja_updated_at')
        THEN '✅ SISTEMA LISTO PARA ELIMINAR MOVIMIENTOS'
        ELSE '❌ SISTEMA NECESITA MÁS CONFIGURACIÓN'
    END as resultado;
