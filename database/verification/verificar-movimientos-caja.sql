-- ================================================
-- VERIFICACIÓN DE TABLA MOVIMIENTOS_CAJA
-- ================================================
-- Script para verificar si la tabla movimientos_caja tiene todas las columnas necesarias

-- Verificar estructura completa de la tabla
SELECT 
    'ESTRUCTURA COMPLETA' as verificacion,
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name IN ('estado', 'updated_at') THEN '✅ REQUERIDA'
        ELSE 'ℹ️ ESTÁNDAR'
    END as importancia
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
ORDER BY column_name;

-- Verificar columnas específicas que causan el error
SELECT 
    'COLUMNAS CRÍTICAS' as verificacion,
    column_name,
    CASE 
        WHEN column_name IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado
FROM (
    SELECT 'estado' as column_name
    UNION ALL
    SELECT 'updated_at' as column_name
) as columnas_criticas
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' 
    AND column_name = columnas_criticas.column_name
);

-- Verificar triggers
SELECT 
    'TRIGGERS' as verificacion,
    trigger_name,
    event_manipulation,
    CASE 
        WHEN trigger_name = 'update_movimientos_caja_updated_at' THEN '✅ REQUERIDO'
        ELSE 'ℹ️ ADICIONAL'
    END as importancia
FROM information_schema.triggers 
WHERE event_object_table = 'movimientos_caja';

-- Verificar índices
SELECT 
    'ÍNDICES' as verificacion,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'movimientos_caja'
AND indexname LIKE '%estado%' OR indexname LIKE '%updated_at%';

-- Verificar función update_updated_at_column
SELECT 
    'FUNCIÓN UPDATE_UPDATED_AT' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') 
        THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado;

-- Verificar registros de prueba
SELECT 
    'REGISTROS DE PRUEBA' as verificacion,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN estado IS NOT NULL THEN 1 END) as con_estado,
    COUNT(CASE WHEN updated_at IS NOT NULL THEN 1 END) as con_updated_at,
    COUNT(CASE WHEN estado = 'activa' THEN 1 END) as activos,
    COUNT(CASE WHEN estado = 'eliminada' THEN 1 END) as eliminados
FROM movimientos_caja;

-- Resumen de verificación
SELECT 
    'RESUMEN' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos_caja' AND column_name = 'estado')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos_caja' AND column_name = 'updated_at')
        AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column')
        AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table = 'movimientos_caja' AND trigger_name = 'update_movimientos_caja_updated_at')
        THEN '✅ TABLA MOVIMIENTOS_CAJA ESTÁ CORRECTAMENTE CONFIGURADA'
        ELSE '❌ TABLA MOVIMIENTOS_CAJA NECESITA REPARACIÓN'
    END as resultado;
