-- Script simple para corregir hora de movimientos de hoy
-- Asigna la hora actual a todos los movimientos realizados hoy

-- 1. Verificar movimientos de hoy
SELECT 
    'MOVIMIENTOS_HOY' as seccion,
    COUNT(*) as total_movimientos,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- 2. Mostrar fechas actuales
SELECT 
    'FECHAS_ACTUALES' as seccion,
    id,
    tipo,
    monto,
    concepto,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_actual
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC
LIMIT 3;

-- 3. CORRECCIÓN: Asignar hora actual a movimientos de hoy
UPDATE movimientos_caja 
SET fecha = CURRENT_DATE + CURRENT_TIME
WHERE fecha::date = CURRENT_DATE;

-- 4. Verificar corrección
SELECT 
    'CORRECCION_APLICADA' as seccion,
    COUNT(*) as movimientos_corregidos
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- 5. Mostrar fechas corregidas
SELECT 
    'FECHAS_CORREGIDAS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_corregida
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC
LIMIT 3;
