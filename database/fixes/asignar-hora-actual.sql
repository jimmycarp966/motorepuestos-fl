-- Script simple para asignar hora actual a movimientos del 19 de agosto
-- Asigna la hora actual del servidor a todos los movimientos de hoy

-- ========================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ========================================

-- Verificar movimientos del 19 de agosto
SELECT 
    'ESTADO_ACTUAL' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_movimientos,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19';

-- Mostrar ejemplos actuales
SELECT 
    'EJEMPLOS_ACTUALES' as seccion,
    id,
    tipo,
    monto,
    concepto,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_actual
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha DESC
LIMIT 3;

-- ========================================
-- 2. CORRECCIÓN: ASIGNAR HORA ACTUAL
-- ========================================

-- Corregir movimientos del 19 de agosto con hora actual
UPDATE movimientos_caja 
SET fecha = '2025-08-19'::date + CURRENT_TIME
WHERE fecha::date = '2025-08-19';

-- Corregir ventas del 19 de agosto con hora actual
UPDATE ventas 
SET fecha = '2025-08-19'::date + CURRENT_TIME
WHERE fecha::date = '2025-08-19';

-- ========================================
-- 3. VERIFICACIÓN FINAL
-- ========================================

-- Verificar movimientos corregidos
SELECT 
    'MOVIMIENTOS_CORREGIDOS' as seccion,
    COUNT(*) as total_movimientos,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19';

-- Mostrar ejemplos de movimientos corregidos
SELECT 
    'EJEMPLOS_CORREGIDOS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_corregida
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha DESC
LIMIT 3;

-- Verificar ventas corregidas
SELECT 
    'VENTAS_CORREGIDAS' as seccion,
    COUNT(*) as total_ventas,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM ventas 
WHERE fecha::date = '2025-08-19';

-- Mostrar ejemplos de ventas corregidas
SELECT 
    'EJEMPLOS_VENTAS_CORREGIDAS' as seccion,
    id,
    total,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_corregida
FROM ventas 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha DESC
LIMIT 3;

-- ========================================
-- 4. RESUMEN FINAL
-- ========================================

SELECT 
    'RESUMEN_FINAL' as seccion,
    'Corrección completada: Hora actual asignada' as descripcion,
    'Todos los movimientos y ventas del 19 de agosto ahora tienen la hora actual del servidor' as resultado;
