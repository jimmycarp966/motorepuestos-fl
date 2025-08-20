-- Script de diagnóstico para ver el estado actual de fechas y horas
-- Este script nos mostrará exactamente qué datos tenemos

-- ========================================
-- 1. DIAGNÓSTICO COMPLETO DE FECHAS
-- ========================================

-- Ver todas las fechas únicas en movimientos_caja
SELECT 
    'FECHAS_UNICAS_MOVIMIENTOS' as seccion,
    fecha::date as fecha,
    COUNT(*) as total_registros,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM movimientos_caja 
GROUP BY fecha::date
ORDER BY fecha::date DESC
LIMIT 10;

-- Ver todas las fechas únicas en ventas
SELECT 
    'FECHAS_UNICAS_VENTAS' as seccion,
    fecha::date as fecha,
    COUNT(*) as total_registros,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM ventas 
GROUP BY fecha::date
ORDER BY fecha::date DESC
LIMIT 10;

-- ========================================
-- 2. DIAGNÓSTICO DE HORAS ESPECÍFICAS
-- ========================================

-- Ver movimientos con horas específicas (21:00, madrugada, etc.)
SELECT 
    'HORAS_ESPECIFICAS_MOVIMIENTOS' as seccion,
    to_char(fecha, 'HH24:MI') as hora,
    COUNT(*) as total_registros,
    fecha::date as fecha_ejemplo
FROM movimientos_caja 
WHERE fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY to_char(fecha, 'HH24:MI'), fecha::date
ORDER BY fecha::date, to_char(fecha, 'HH24:MI');

-- Ver ventas con horas específicas
SELECT 
    'HORAS_ESPECIFICAS_VENTAS' as seccion,
    to_char(fecha, 'HH24:MI') as hora,
    COUNT(*) as total_registros,
    fecha::date as fecha_ejemplo
FROM ventas 
WHERE fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY to_char(fecha, 'HH24:MI'), fecha::date
ORDER BY fecha::date, to_char(fecha, 'HH24:MI');

-- ========================================
-- 3. EJEMPLOS DETALLADOS
-- ========================================

-- Mostrar ejemplos de movimientos del 18, 19 y 20 de agosto
SELECT 
    'EJEMPLOS_MOVIMIENTOS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_completa,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM movimientos_caja 
WHERE fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')
ORDER BY fecha DESC
LIMIT 10;

-- Mostrar ejemplos de ventas del 18, 19 y 20 de agosto
SELECT 
    'EJEMPLOS_VENTAS' as seccion,
    id,
    total,
    fecha as fecha_completa,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM ventas 
WHERE fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')
ORDER BY fecha DESC
LIMIT 10;

-- ========================================
-- 4. ANÁLISIS DE PROBLEMAS
-- ========================================

-- Verificar si hay registros con horas de madrugada (00:00 - 05:59)
SELECT 
    'HORAS_MADRUGADA' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_registros,
    MIN(fecha) as ejemplo_mas_antiguo,
    MAX(fecha) as ejemplo_mas_reciente
FROM movimientos_caja 
WHERE EXTRACT(hour FROM fecha) BETWEEN 0 AND 5
AND fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')

UNION ALL

SELECT 
    'HORAS_MADRUGADA' as seccion,
    'ventas' as tabla,
    COUNT(*) as total_registros,
    MIN(fecha) as ejemplo_mas_antiguo,
    MAX(fecha) as ejemplo_mas_reciente
FROM ventas 
WHERE EXTRACT(hour FROM fecha) BETWEEN 0 AND 5
AND fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20');

-- Verificar si hay registros con hora fija 21:00
SELECT 
    'HORA_FIJA_21' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_registros,
    MIN(fecha) as ejemplo_mas_antiguo,
    MAX(fecha) as ejemplo_mas_reciente
FROM movimientos_caja 
WHERE to_char(fecha, 'HH24:MI') = '21:00'
AND fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')

UNION ALL

SELECT 
    'HORA_FIJA_21' as seccion,
    'ventas' as tabla,
    COUNT(*) as total_registros,
    MIN(fecha) as ejemplo_mas_antiguo,
    MAX(fecha) as ejemplo_mas_reciente
FROM ventas 
WHERE to_char(fecha, 'HH24:MI') = '21:00'
AND fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20');

-- ========================================
-- 5. RESUMEN DEL DIAGNÓSTICO
-- ========================================

SELECT 
    'RESUMEN_DIAGNOSTICO' as seccion,
    'Ejecuta este script para ver el estado real de las fechas y horas en la base de datos' as instruccion,
    'Después de ver los resultados, podremos crear un script de corrección específico' as siguiente_paso;
