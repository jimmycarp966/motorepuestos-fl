-- ================================================
-- VERIFICACIÓN DE FECHAS DE VENTAS
-- ================================================
-- Script para verificar las fechas y horas de las ventas existentes

-- Verificar configuración de timezone del servidor
SELECT 
    'CONFIGURACIÓN TIMEZONE' as verificacion,
    current_setting('timezone') as timezone_actual,
    NOW() as hora_actual_servidor,
    NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina;

-- Verificar las últimas 10 ventas con sus fechas
SELECT 
    'ÚLTIMAS 10 VENTAS' as verificacion,
    id,
    total,
    metodo_pago,
    estado,
    fecha,
    created_at,
    updated_at,
    EXTRACT(HOUR FROM created_at) as hora_creacion,
    EXTRACT(MINUTE FROM created_at) as minuto_creacion,
    created_at::time as hora_completa_creacion,
    created_at::date as fecha_creacion,
    CASE 
        WHEN EXTRACT(HOUR FROM created_at) = 21 THEN '⚠️ HORA PROBLEMÁTICA (21:00)'
        WHEN EXTRACT(HOUR FROM created_at) = 0 THEN '⚠️ HORA PROBLEMÁTICA (00:00)'
        ELSE '✅ HORA NORMAL'
    END as estado_hora
FROM ventas 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar distribución de horas de creación
SELECT 
    'DISTRIBUCIÓN DE HORAS' as verificacion,
    EXTRACT(HOUR FROM created_at) as hora,
    COUNT(*) as cantidad_ventas,
    CASE 
        WHEN EXTRACT(HOUR FROM created_at) = 21 THEN '⚠️ PROBLEMÁTICA'
        WHEN EXTRACT(HOUR FROM created_at) = 0 THEN '⚠️ PROBLEMÁTICA'
        ELSE '✅ NORMAL'
    END as estado
FROM ventas 
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hora;

-- Verificar ventas de hoy
SELECT 
    'VENTAS DE HOY' as verificacion,
    COUNT(*) as total_ventas_hoy,
    COUNT(CASE WHEN EXTRACT(HOUR FROM created_at) = 21 THEN 1 END) as ventas_21hs,
    COUNT(CASE WHEN EXTRACT(HOUR FROM created_at) = 0 THEN 1 END) as ventas_00hs,
    COUNT(CASE WHEN EXTRACT(HOUR FROM created_at) NOT IN (0, 21) THEN 1 END) as ventas_horas_normales
FROM ventas 
WHERE created_at::date = CURRENT_DATE;

-- Verificar ventas de la última semana
SELECT 
    'VENTAS ÚLTIMA SEMANA' as verificacion,
    created_at::date as fecha,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN EXTRACT(HOUR FROM created_at) = 21 THEN 1 END) as ventas_21hs,
    COUNT(CASE WHEN EXTRACT(HOUR FROM created_at) = 0 THEN 1 END) as ventas_00hs,
    COUNT(CASE WHEN EXTRACT(HOUR FROM created_at) NOT IN (0, 21) THEN 1 END) as ventas_horas_normales
FROM ventas 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY created_at::date
ORDER BY fecha DESC;

-- Verificar movimientos de caja correspondientes
SELECT 
    'MOVIMIENTOS DE CAJA (últimos 5)' as verificacion,
    id,
    tipo,
    monto,
    concepto,
    fecha,
    created_at,
    EXTRACT(HOUR FROM created_at) as hora_creacion,
    EXTRACT(MINUTE FROM created_at) as minuto_creacion,
    created_at::time as hora_completa_creacion
FROM movimientos_caja 
WHERE concepto LIKE '%venta%'
ORDER BY created_at DESC 
LIMIT 5;

-- Resumen de problemas de fechas
SELECT 
    'RESUMEN DE PROBLEMAS' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM ventas 
            WHERE EXTRACT(HOUR FROM created_at) IN (0, 21)
        ) THEN '⚠️ HAY VENTAS CON HORAS PROBLEMÁTICAS'
        ELSE '✅ TODAS LAS VENTAS TIENEN HORAS NORMALES'
    END as estado_ventas,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM movimientos_caja 
            WHERE EXTRACT(HOUR FROM created_at) IN (0, 21)
        ) THEN '⚠️ HAY MOVIMIENTOS CON HORAS PROBLEMÁTICAS'
        ELSE '✅ TODOS LOS MOVIMIENTOS TIENEN HORAS NORMALES'
    END as estado_movimientos;


