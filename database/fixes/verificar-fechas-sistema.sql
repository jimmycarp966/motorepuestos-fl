-- Script para verificar fechas en todo el sistema
-- Este script ayuda a identificar problemas de zona horaria en todas las tablas

-- 1. Verificar configuración de zona horaria del servidor
SELECT 
    'CONFIGURACIÓN DEL SERVIDOR' as seccion,
    current_setting('timezone') as zona_horaria_servidor,
    now() as hora_actual_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina;

-- 2. Verificar estructura de tablas y tipos de datos
SELECT 
    'ESTRUCTURA_TABLAS' as seccion,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('movimientos_caja', 'ventas', 'productos', 'clientes', 'empleados')
AND column_name IN ('fecha', 'created_at', 'updated_at')
ORDER BY table_name, column_name;

-- 3. Verificar fechas en movimientos_caja (solo si es timestamp)
SELECT 
    'MOVIMIENTOS_CAJA' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs,
    COUNT(CASE WHEN fecha::time = '00:00:00' THEN 1 END) as registros_00hs,
    COUNT(CASE WHEN fecha::time NOT IN ('21:00:00', '00:00:00') THEN 1 END) as otros_horarios,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 4. Verificar fechas en ventas (solo si es timestamp)
SELECT 
    'VENTAS' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs,
    COUNT(CASE WHEN fecha::time = '00:00:00' THEN 1 END) as registros_00hs,
    COUNT(CASE WHEN fecha::time NOT IN ('21:00:00', '00:00:00') THEN 1 END) as otros_horarios,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 5. Verificar fechas en productos (updated_at)
SELECT 
    'PRODUCTOS' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN updated_at::time = '21:00:00' THEN 1 END) as registros_21hs,
    COUNT(CASE WHEN updated_at::time = '00:00:00' THEN 1 END) as registros_00hs,
    COUNT(CASE WHEN updated_at::time NOT IN ('21:00:00', '00:00:00') THEN 1 END) as otros_horarios,
    MIN(updated_at) as fecha_mas_antigua,
    MAX(updated_at) as fecha_mas_reciente,
    COUNT(CASE WHEN updated_at::date = CURRENT_DATE THEN 1 END) as registros_hoy
FROM productos 
WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days';

-- 6. Verificar fechas en clientes (updated_at)
SELECT 
    'CLIENTES' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN updated_at::time = '21:00:00' THEN 1 END) as registros_21hs,
    COUNT(CASE WHEN updated_at::time = '00:00:00' THEN 1 END) as registros_00hs,
    COUNT(CASE WHEN updated_at::time NOT IN ('21:00:00', '00:00:00') THEN 1 END) as otros_horarios,
    MIN(updated_at) as fecha_mas_antigua,
    MAX(updated_at) as fecha_mas_reciente,
    COUNT(CASE WHEN updated_at::date = CURRENT_DATE THEN 1 END) as registros_hoy
FROM clientes 
WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days';

-- 7. Verificar fechas en empleados (updated_at)
SELECT 
    'EMPLEADOS' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN updated_at::time = '21:00:00' THEN 1 END) as registros_21hs,
    COUNT(CASE WHEN updated_at::time = '00:00:00' THEN 1 END) as registros_00hs,
    COUNT(CASE WHEN updated_at::time NOT IN ('21:00:00', '00:00:00') THEN 1 END) as otros_horarios,
    MIN(updated_at) as fecha_mas_antigua,
    MAX(updated_at) as fecha_mas_reciente,
    COUNT(CASE WHEN updated_at::date = CURRENT_DATE THEN 1 END) as registros_hoy
FROM empleados 
WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days';

-- 8. Mostrar ejemplos de fechas problemáticas en movimientos_caja
SELECT 
    'EJEMPLOS_MOVIMIENTOS_CAJA' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora,
    CASE 
        WHEN fecha::time = '21:00:00' THEN '⚠️ POSIBLE PROBLEMA DE ZONA HORARIA'
        WHEN fecha::time = '00:00:00' THEN '✅ HORA CORRECTA'
        ELSE '✅ HORA NORMAL'
    END as estado
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
AND fecha::time = '21:00:00'
ORDER BY fecha DESC
LIMIT 5;

-- 9. Mostrar ejemplos de fechas problemáticas en ventas
SELECT 
    'EJEMPLOS_VENTAS' as seccion,
    id,
    total,
    metodo_pago,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora,
    CASE 
        WHEN fecha::time = '21:00:00' THEN '⚠️ POSIBLE PROBLEMA DE ZONA HORARIA'
        WHEN fecha::time = '00:00:00' THEN '✅ HORA CORRECTA'
        ELSE '✅ HORA NORMAL'
    END as estado
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
AND fecha::time = '21:00:00'
ORDER BY fecha DESC
LIMIT 5;

-- 10. Estadísticas generales de fechas por día
SELECT 
    'ESTADISTICAS_POR_DIA' as seccion,
    fecha::date as dia,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs,
    COUNT(CASE WHEN fecha::time = '00:00:00' THEN 1 END) as registros_00hs,
    COUNT(CASE WHEN fecha::time NOT IN ('21:00:00', '00:00:00') THEN 1 END) as otros_horarios
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::date
ORDER BY dia DESC;

-- 11. Resumen de problemas encontrados
WITH problemas AS (
    SELECT 
        'movimientos_caja' as tabla,
        COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_problematicos
    FROM movimientos_caja 
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'ventas' as tabla,
        COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_problematicos
    FROM ventas 
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'productos' as tabla,
        COUNT(CASE WHEN updated_at::time = '21:00:00' THEN 1 END) as registros_problematicos
    FROM productos 
    WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'clientes' as tabla,
        COUNT(CASE WHEN updated_at::time = '21:00:00' THEN 1 END) as registros_problematicos
    FROM clientes 
    WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'empleados' as tabla,
        COUNT(CASE WHEN updated_at::time = '21:00:00' THEN 1 END) as registros_problematicos
    FROM empleados 
    WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    'RESUMEN_PROBLEMAS' as seccion,
    tabla,
    registros_problematicos,
    CASE 
        WHEN registros_problematicos > 0 THEN '⚠️ REQUIERE CORRECCIÓN'
        ELSE '✅ SIN PROBLEMAS'
    END as estado
FROM problemas
ORDER BY registros_problematicos DESC;

-- 12. Verificar registros de hoy para confirmar que las correcciones funcionan
SELECT 
    'REGISTROS_HOY' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_hoy,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs_hoy
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE

UNION ALL

SELECT 
    'REGISTROS_HOY' as seccion,
    'ventas' as tabla,
    COUNT(*) as total_hoy,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs_hoy
FROM ventas 
WHERE fecha::date = CURRENT_DATE;
