-- Script simple para verificar fechas en el sistema
-- Versión mínima sin errores de sintaxis

-- 1. Configuración del servidor
SELECT 
    'CONFIGURACIÓN' as seccion,
    current_setting('timezone') as zona_horaria,
    now() as hora_actual,
    CURRENT_DATE as fecha_actual;

-- 2. Estructura de tablas
SELECT 
    'ESTRUCTURA' as seccion,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('movimientos_caja', 'ventas')
AND column_name = 'fecha'
ORDER BY table_name;

-- 3. Registros de hoy en movimientos_caja
SELECT 
    'MOVIMIENTOS_HOY' as seccion,
    COUNT(*) as total_registros_hoy
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- 4. Registros de hoy en ventas
SELECT 
    'VENTAS_HOY' as seccion,
    COUNT(*) as total_registros_hoy
FROM ventas 
WHERE fecha::date = CURRENT_DATE;
