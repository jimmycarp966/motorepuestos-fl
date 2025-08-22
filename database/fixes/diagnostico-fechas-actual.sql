-- Script de diagnóstico para entender el problema actual de fechas
-- Ejecutar para ver el estado exacto de las fechas

-- ========================================
-- 1. DIAGNÓSTICO GENERAL DEL SISTEMA
-- ========================================

-- Verificar configuración actual
SELECT 
    'CONFIGURACIÓN_ACTUAL' as seccion,
    current_setting('timezone') as zona_horaria_servidor,
    now() as hora_actual_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina,
    CURRENT_DATE as fecha_actual_servidor,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date as fecha_argentina;

-- ========================================
-- 2. ANÁLISIS DETALLADO DE VENTAS RECIENTES
-- ========================================

-- Ver todas las ventas de los últimos 3 días con detalles
SELECT 
    'VENTAS_ULTIMOS_3_DIAS' as seccion,
    id,
    total,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::date as solo_fecha,
    fecha::time as solo_hora,
    EXTRACT(hour FROM fecha) as hora_numerica,
    EXTRACT(minute FROM fecha) as minuto_numerico,
    CASE 
        WHEN fecha::date = CURRENT_DATE THEN 'HOY'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '1 day' THEN 'AYER'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '2 days' THEN 'ANTEAYER'
        ELSE 'MÁS ANTIGUO'
    END as cuando
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY fecha DESC;

-- ========================================
-- 3. ANÁLISIS DE MOVIMIENTOS DE CAJA
-- ========================================

-- Ver todos los movimientos de los últimos 3 días
SELECT 
    'MOVIMIENTOS_ULTIMOS_3_DIAS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::date as solo_fecha,
    fecha::time as solo_hora,
    EXTRACT(hour FROM fecha) as hora_numerica,
    EXTRACT(minute FROM fecha) as minuto_numerico,
    CASE 
        WHEN fecha::date = CURRENT_DATE THEN 'HOY'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '1 day' THEN 'AYER'
        WHEN fecha::date = CURRENT_DATE - INTERVAL '2 days' THEN 'ANTEAYER'
        ELSE 'MÁS ANTIGUO'
    END as cuando
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY fecha DESC;

-- ========================================
-- 4. ESTADÍSTICAS POR HORA
-- ========================================

-- Ver cuántas ventas hay por hora
SELECT 
    'ESTADISTICAS_VENTAS_POR_HORA' as seccion,
    fecha::time as hora,
    COUNT(*) as cantidad_ventas,
    MIN(fecha) as primera_venta_hora,
    MAX(fecha) as ultima_venta_hora
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::time
ORDER BY fecha::time;

-- Ver cuántos movimientos hay por hora
SELECT 
    'ESTADISTICAS_MOVIMIENTOS_POR_HORA' as seccion,
    fecha::time as hora,
    COUNT(*) as cantidad_movimientos,
    MIN(fecha) as primer_movimiento_hora,
    MAX(fecha) as ultimo_movimiento_hora
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::time
ORDER BY fecha::time;

-- ========================================
-- 5. VERIFICAR SI HAY PATRÓN DE FECHAS
-- ========================================

-- Verificar si todas las fechas son iguales
SELECT 
    'ANÁLISIS_PATRÓN_FECHAS' as seccion,
    fecha::date as fecha,
    COUNT(*) as cantidad_registros,
    MIN(fecha::time) as hora_mas_temprana,
    MAX(fecha::time) as hora_mas_tardia,
    COUNT(DISTINCT fecha::time) as horas_diferentes
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::date
ORDER BY fecha::date DESC;

-- ========================================
-- 6. VERIFICAR CONFIGURACIÓN DE TRIGGERS
-- ========================================

-- Verificar si los triggers están funcionando
SELECT 
    'VERIFICACIÓN_TRIGGERS' as seccion,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ TRIGGER ACTIVO'
        ELSE '❌ TRIGGER FALTANTE'
    END as estado
FROM information_schema.triggers 
WHERE trigger_name LIKE '%timezone%'
ORDER BY trigger_name;

-- ========================================
-- 7. SIMULAR FECHA ACTUAL
-- ========================================

-- Ver qué fecha y hora debería ser ahora
SELECT 
    'SIMULACIÓN_FECHA_ACTUAL' as seccion,
    'Servidor' as origen,
    now() as fecha_hora_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as fecha_hora_argentina,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date as fecha_argentina,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::time as hora_argentina

UNION ALL

SELECT 
    'SIMULACIÓN_FECHA_ACTUAL' as seccion,
    'UTC' as origen,
    now() AT TIME ZONE 'UTC' as fecha_hora_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as fecha_hora_argentina,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date as fecha_argentina,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::time as hora_argentina;

-- ========================================
-- 8. RESUMEN DEL PROBLEMA
-- ========================================

WITH resumen AS (
    SELECT 
        'VENTAS' as tabla,
        COUNT(*) as total_registros,
        COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as registros_hoy,
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
        COUNT(CASE WHEN fecha::time = '18:00:00' THEN 1 END) as registros_18hs,
        COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_21hs,
        MIN(fecha) as fecha_mas_antigua,
        MAX(fecha) as fecha_mas_reciente
    FROM movimientos_caja 
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    'RESUMEN_DIAGNÓSTICO' as seccion,
    tabla,
    total_registros,
    registros_hoy,
    registros_18hs,
    registros_21hs,
    fecha_mas_antigua,
    fecha_mas_reciente,
    CASE 
        WHEN registros_18hs > 0 AND registros_21hs = 0 THEN '✅ CORREGIDO A 18:00'
        WHEN registros_21hs > 0 THEN '❌ AÚN HAY 21:00'
        WHEN registros_18hs = 0 AND registros_21hs = 0 THEN '⚠️ SIN PATRÓN CLARO'
        ELSE '❓ ESTADO INDEFINIDO'
    END as estado
FROM resumen
ORDER BY tabla;
