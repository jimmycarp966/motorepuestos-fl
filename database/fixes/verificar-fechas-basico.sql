-- Script básico para verificar fechas en el sistema
-- Versión ultra-simplificada sin conversiones problemáticas

-- 1. Verificar configuración del servidor
SELECT 
    'CONFIGURACIÓN' as seccion,
    current_setting('timezone') as zona_horaria,
    now() as hora_actual,
    CURRENT_DATE as fecha_actual;

-- 2. Verificar estructura de tablas
SELECT 
    'ESTRUCTURA' as seccion,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('movimientos_caja', 'ventas')
AND column_name = 'fecha'
ORDER BY table_name;

-- 3. Contar registros de hoy en movimientos_caja
SELECT 
    'MOVIMIENTOS_HOY' as seccion,
    COUNT(*) as total_registros_hoy
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- 4. Contar registros de hoy en ventas
SELECT 
    'VENTAS_HOY' as seccion,
    COUNT(*) as total_registros_hoy
FROM ventas 
WHERE fecha::date = CURRENT_DATE;

-- 5. Mostrar fecha más reciente de movimientos_caja
SELECT 
    'ULTIMA_FECHA_MOVIMIENTOS' as seccion,
    fecha as fecha_mas_reciente
FROM movimientos_caja 
ORDER BY fecha DESC
LIMIT 1;

-- 6. Mostrar fecha más reciente de ventas
SELECT 
    'ULTIMA_FECHA_VENTAS' as seccion,
    fecha as fecha_mas_reciente
FROM ventas 
ORDER BY fecha DESC
LIMIT 1;

-- 7. Resumen de movimientos_caja últimos 7 días
SELECT 
    'RESUMEN_MOVIMIENTOS' as seccion,
    COUNT(*) as total_ultimos_7_dias
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 8. Resumen de ventas últimos 7 días
SELECT 
    'RESUMEN_VENTAS' as seccion,
    COUNT(*) as total_ultimos_7_dias
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';
