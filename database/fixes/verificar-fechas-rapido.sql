-- Script rápido para verificar fechas en el sistema
-- Versión simplificada que evita errores de tipos de datos

-- 1. Verificar configuración del servidor
SELECT 
    'CONFIGURACIÓN' as seccion,
    current_setting('timezone') as zona_horaria,
    now() as hora_actual,
    CURRENT_DATE as fecha_actual;

-- 2. Verificar estructura de campos de fecha
SELECT 
    'ESTRUCTURA_FECHAS' as seccion,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('movimientos_caja', 'ventas')
AND column_name = 'fecha'
ORDER BY table_name;

-- 3. Verificar registros de hoy en movimientos_caja
SELECT 
    'MOVIMIENTOS_HOY' as seccion,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
    MIN(fecha) as fecha_mas_antigua_hoy,
    MAX(fecha) as fecha_mas_reciente_hoy
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- 4. Verificar registros de hoy en ventas
SELECT 
    'VENTAS_HOY' as seccion,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
    MIN(fecha) as fecha_mas_antigua_hoy,
    MAX(fecha) as fecha_mas_reciente_hoy
FROM ventas 
WHERE fecha::date = CURRENT_DATE;

-- 5. Mostrar algunos ejemplos de registros de hoy (solo si es timestamp)
SELECT 
    'EJEMPLOS_MOVIMIENTOS_HOY' as seccion,
    id,
    tipo,
    monto,
    concepto,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_completa,
    CASE 
        WHEN fecha::text LIKE '%21:00:00%' THEN '21:00:00'
        WHEN fecha::text LIKE '%00:00:00%' THEN '00:00:00'
        ELSE 'OTRA_HORA'
    END as hora_detectada
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC
LIMIT 5;

-- 6. Mostrar algunos ejemplos de ventas de hoy (solo si es timestamp)
SELECT 
    'EJEMPLOS_VENTAS_HOY' as seccion,
    id,
    total,
    metodo_pago,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_completa,
    CASE 
        WHEN fecha::text LIKE '%21:00:00%' THEN '21:00:00'
        WHEN fecha::text LIKE '%00:00:00%' THEN '00:00:00'
        ELSE 'OTRA_HORA'
    END as hora_detectada
FROM ventas 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC
LIMIT 5;

-- 7. Verificar si hay registros con hora 21:00:00 (problemática)
SELECT 
    'PROBLEMAS_21HS' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as registros_21hs
FROM movimientos_caja 
WHERE fecha::text LIKE '%21:00:00%'
AND fecha::date = CURRENT_DATE

UNION ALL

SELECT 
    'PROBLEMAS_21HS' as seccion,
    'ventas' as tabla,
    COUNT(*) as registros_21hs
FROM ventas 
WHERE fecha::text LIKE '%21:00:00%'
AND fecha::date = CURRENT_DATE;

-- 8. Resumen general
SELECT 
    'RESUMEN_GENERAL' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_ultimos_7_dias,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
    COUNT(CASE WHEN fecha::text LIKE '%21:00:00%' THEN 1 END) as registros_21hs
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
    'RESUMEN_GENERAL' as seccion,
    'ventas' as tabla,
    COUNT(*) as total_ultimos_7_dias,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
    COUNT(CASE WHEN fecha::text LIKE '%21:00:00%' THEN 1 END) as registros_21hs
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 9. Verificar tipos de datos específicos
SELECT 
    'TIPOS_DATOS' as seccion,
    'movimientos_caja.fecha' as campo,
    pg_typeof(fecha) as tipo_dato,
    COUNT(*) as total_registros
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
GROUP BY pg_typeof(fecha)

UNION ALL

SELECT 
    'TIPOS_DATOS' as seccion,
    'ventas.fecha' as campo,
    pg_typeof(fecha) as tipo_dato,
    COUNT(*) as total_registros
FROM ventas 
WHERE fecha::date = CURRENT_DATE
GROUP BY pg_typeof(fecha);
