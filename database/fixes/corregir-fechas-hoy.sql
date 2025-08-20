-- Script para corregir fechas de movimientos realizados hoy
-- Este script actualiza las fechas con la hora real actual

-- 1. Verificar movimientos de hoy antes de la corrección
SELECT 
    'ANTES_CORRECCION' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_movimientos_hoy,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- 2. Mostrar ejemplos de fechas actuales
SELECT 
    'EJEMPLOS_ACTUALES' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_actual,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC
LIMIT 5;

-- 3. CORRECCIÓN: Actualizar fechas de movimientos de hoy con hora real
-- Esto asigna la hora actual a cada movimiento, manteniendo el orden cronológico
WITH movimientos_hoy AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY fecha) as orden
    FROM movimientos_caja 
    WHERE fecha::date = CURRENT_DATE
)
UPDATE movimientos_caja 
SET fecha = CURRENT_DATE + 
    (CURRENT_TIME - INTERVAL '1 hour' * (SELECT COUNT(*) FROM movimientos_hoy) + 
     INTERVAL '1 hour' * mh.orden)
FROM movimientos_hoy mh
WHERE movimientos_caja.id = mh.id
AND movimientos_caja.fecha::date = CURRENT_DATE;

-- 4. Verificar movimientos de hoy después de la corrección
SELECT 
    'DESPUES_CORRECCION' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_movimientos_hoy,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- 5. Mostrar ejemplos de fechas corregidas
SELECT 
    'EJEMPLOS_CORREGIDOS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_corregida,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC
LIMIT 5;

-- 6. Resumen de la corrección
SELECT 
    'RESUMEN_CORRECCION' as seccion,
    'Movimientos de hoy corregidos con hora real' as descripcion,
    COUNT(*) as total_corregidos
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;
