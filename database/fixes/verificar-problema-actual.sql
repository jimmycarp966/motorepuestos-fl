-- Script de verificación específico para el problema actual
-- Ejecutar para ver exactamente qué está pasando con las fechas

-- ========================================
-- 1. VERIFICAR FECHA ACTUAL DEL SERVIDOR
-- ========================================

SELECT 
    'FECHA_ACTUAL_SERVIDOR' as seccion,
    now() as hora_actual_servidor,
    CURRENT_DATE as fecha_actual_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date as fecha_argentina,
    CASE 
        WHEN CURRENT_DATE = (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date THEN '✅ FECHA CORRECTA'
        ELSE '❌ FECHA INCORRECTA'
    END as estado_fecha;

-- ========================================
-- 2. VERIFICAR VENTAS POR FECHA
-- ========================================

-- Ver todas las fechas únicas en ventas
SELECT 
    'FECHAS_UNICAS_VENTAS' as seccion,
    fecha::date as fecha,
    COUNT(*) as total_ventas,
    MIN(fecha::time) as hora_mas_temprana,
    MAX(fecha::time) as hora_mas_tardia,
    COUNT(DISTINCT fecha::time) as horas_diferentes,
    CASE 
        WHEN fecha::date = CURRENT_DATE THEN 'HOY'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '1 day' THEN 'AYER'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '2 days' THEN 'ANTEAYER'
        ELSE 'OTRO DÍA'
    END as cuando
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::date
ORDER BY fecha::date DESC;

-- ========================================
-- 3. VERIFICAR MOVIMIENTOS POR FECHA
-- ========================================

-- Ver todas las fechas únicas en movimientos
SELECT 
    'FECHAS_UNICAS_MOVIMIENTOS' as seccion,
    fecha::date as fecha,
    COUNT(*) as total_movimientos,
    MIN(fecha::time) as hora_mas_temprana,
    MAX(fecha::time) as hora_mas_tardia,
    COUNT(DISTINCT fecha::time) as horas_diferentes,
    CASE 
        WHEN fecha::date = CURRENT_DATE THEN 'HOY'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '1 day' THEN 'AYER'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '2 days' THEN 'ANTEAYER'
        ELSE 'OTRO DÍA'
    END as cuando
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::date
ORDER BY fecha::date DESC;

-- ========================================
-- 4. VERIFICAR VENTAS DE HOY ESPECÍFICAMENTE
-- ========================================

-- Ver ventas de hoy con detalles
SELECT 
    'VENTAS_HOY_DETALLE' as seccion,
    id,
    total,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::date as solo_fecha,
    fecha::time as solo_hora,
    CASE 
        WHEN fecha::date = CURRENT_DATE THEN '✅ FECHA CORRECTA'
        ELSE '❌ FECHA INCORRECTA'
    END as estado_fecha,
    CASE 
        WHEN fecha::time = '18:00:00' THEN '⚠️ TODAS A LA MISMA HORA'
        WHEN fecha::time BETWEEN '08:00:00' AND '22:00:00' THEN '✅ HORARIO NORMAL'
        ELSE '❓ HORARIO EXTRAÑO'
    END as estado_hora
FROM ventas 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha;

-- ========================================
-- 5. VERIFICAR MOVIMIENTOS DE HOY ESPECÍFICAMENTE
-- ========================================

-- Ver movimientos de hoy con detalles
SELECT 
    'MOVIMIENTOS_HOY_DETALLE' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::date as solo_fecha,
    fecha::time as solo_hora,
    CASE 
        WHEN fecha::date = CURRENT_DATE THEN '✅ FECHA CORRECTA'
        ELSE '❌ FECHA INCORRECTA'
    END as estado_fecha,
    CASE 
        WHEN fecha::time = '18:00:00' THEN '⚠️ TODOS A LA MISMA HORA'
        WHEN fecha::time BETWEEN '08:00:00' AND '22:00:00' THEN '✅ HORARIO NORMAL'
        ELSE '❓ HORARIO EXTRAÑO'
    END as estado_hora
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha;

-- ========================================
-- 6. VERIFICAR PATRÓN DE HORAS
-- ========================================

-- Ver cuántas ventas hay por hora
SELECT 
    'PATRON_HORAS_VENTAS' as seccion,
    fecha::time as hora,
    COUNT(*) as cantidad_ventas,
    MIN(fecha) as ejemplo_primera,
    MAX(fecha) as ejemplo_ultima
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::time
ORDER BY fecha::time;

-- Ver cuántos movimientos hay por hora
SELECT 
    'PATRON_HORAS_MOVIMIENTOS' as seccion,
    fecha::time as hora,
    COUNT(*) as cantidad_movimientos,
    MIN(fecha) as ejemplo_primero,
    MAX(fecha) as ejemplo_ultimo
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::time
ORDER BY fecha::time;

-- ========================================
-- 7. VERIFICAR SI HAY VENTAS DEL 19 DE AGOSTO
-- ========================================

-- Verificar si hay ventas del 19 de agosto
SELECT 
    'VENTAS_19_AGOSTO' as seccion,
    COUNT(*) as total_ventas_19,
    MIN(fecha) as primera_venta,
    MAX(fecha) as ultima_venta,
    COUNT(DISTINCT fecha::time) as horas_diferentes
FROM ventas 
WHERE fecha::date = '2025-08-19';

-- Mostrar ejemplos de ventas del 19 de agosto
SELECT 
    'EJEMPLOS_VENTAS_19_AGOSTO' as seccion,
    id,
    total,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora
FROM ventas 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha
LIMIT 5;

-- ========================================
-- 8. RESUMEN DEL PROBLEMA ACTUAL
-- ========================================

WITH resumen AS (
    SELECT 
        'VENTAS' as tabla,
        COUNT(*) as total_registros,
        COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
        COUNT(CASE WHEN fecha::date = '2025-08-19' THEN 1 END) as registros_19_agosto,
        COUNT(CASE WHEN fecha::time = '18:00:00' THEN 1 END) as registros_18hs,
        COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs,
        MIN(fecha) as fecha_mas_antigua,
        MAX(fecha) as fecha_mas_reciente
    FROM ventas 
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'MOVIMIENTOS_CAJA' as tabla,
        COUNT(*) as total_registros,
        COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
        COUNT(CASE WHEN fecha::date = '2025-08-19' THEN 1 END) as registros_19_agosto,
        COUNT(CASE WHEN fecha::time = '18:00:00' THEN 1 END) as registros_18hs,
        COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs,
        MIN(fecha) as fecha_mas_antigua,
        MAX(fecha) as fecha_mas_reciente
    FROM movimientos_caja 
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    'RESUMEN_PROBLEMA_ACTUAL' as seccion,
    tabla,
    total_registros,
    registros_hoy,
    registros_19_agosto,
    registros_18hs,
    registros_21hs,
    fecha_mas_antigua,
    fecha_mas_reciente,
    CASE 
        WHEN registros_19_agosto > 0 THEN '❌ HAY VENTAS DEL 19 (DEBERÍAN SER DEL 20)'
        WHEN registros_18hs > 0 THEN '⚠️ HAY VENTAS A LAS 18:00 (MISMA HORA)'
        WHEN registros_21hs > 0 THEN '❌ AÚN HAY VENTAS A LAS 21:00'
        ELSE '✅ SIN PROBLEMAS DETECTADOS'
    END as problema_principal
FROM resumen
ORDER BY tabla;
