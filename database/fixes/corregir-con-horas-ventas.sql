-- Script para corregir movimientos de caja usando las horas exactas de las ventas
-- Usa las horas reales de las ventas para asignar a los movimientos correspondientes

-- ========================================
-- 1. VERIFICAR VENTAS Y MOVIMIENTOS
-- ========================================

-- Ver ventas del 19 de agosto con horas exactas
SELECT 
    'VENTAS_CON_HORAS' as seccion,
    id as venta_id,
    total,
    fecha as fecha_venta,
    to_char(fecha, 'HH24:MI:SS') as hora_venta
FROM ventas 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha ASC;

-- Ver movimientos de caja del 19 de agosto
SELECT 
    'MOVIMIENTOS_ACTUALES' as seccion,
    id as movimiento_id,
    tipo,
    monto,
    concepto,
    fecha as fecha_movimiento,
    to_char(fecha, 'HH24:MI:SS') as hora_movimiento
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha ASC;

-- ========================================
-- 2. CORREGIR MOVIMIENTOS DE VENTAS (INGRESOS)
-- ========================================

-- Crear tabla temporal con ventas y sus horas
WITH ventas_horas AS (
    SELECT 
        id as venta_id,
        total,
        fecha as fecha_venta,
        ROW_NUMBER() OVER (ORDER BY fecha) as orden_venta
    FROM ventas 
    WHERE fecha::date = '2025-08-19'
),
movimientos_ventas AS (
    SELECT 
        id as movimiento_id,
        monto,
        concepto,
        fecha as fecha_movimiento,
        ROW_NUMBER() OVER (ORDER BY fecha) as orden_movimiento
    FROM movimientos_caja 
    WHERE fecha::date = '2025-08-19'
    AND tipo = 'Ingreso'
)
-- Actualizar movimientos de ventas con las horas exactas de las ventas
UPDATE movimientos_caja 
SET fecha = vh.fecha_venta
FROM ventas_horas vh, movimientos_ventas mv
WHERE movimientos_caja.id = mv.movimiento_id
AND mv.orden_movimiento = vh.orden_venta
AND movimientos_caja.fecha::date = '2025-08-19'
AND movimientos_caja.tipo = 'Ingreso';

-- ========================================
-- 3. CORREGIR OTROS MOVIMIENTOS (NO VENTAS)
-- ========================================

-- Para movimientos que no son ventas (apertura de caja, gastos, etc.)
-- Asignar horas distribuidas entre 8:00 AM y 22:00 PM
WITH otros_movimientos AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY fecha) as orden
    FROM movimientos_caja 
    WHERE fecha::date = '2025-08-19'
    AND tipo != 'Ingreso'
)
UPDATE movimientos_caja 
SET fecha = '2025-08-19 08:00:00-03'::timestamp with time zone + 
    (INTERVAL '1 hour' * (om.orden - 1)) +  -- 1 hora entre cada movimiento
    (INTERVAL '1 minute' * (om.orden * 15))  -- 15 minutos adicionales para variación
FROM otros_movimientos om
WHERE movimientos_caja.id = om.id
AND movimientos_caja.fecha::date = '2025-08-19'
AND movimientos_caja.tipo != 'Ingreso';

-- ========================================
-- 4. VERIFICACIÓN FINAL
-- ========================================

-- Verificar movimientos corregidos
SELECT 
    'MOVIMIENTOS_CORREGIDOS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_corregida,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha ASC;

-- Comparar ventas con movimientos de ventas
SELECT 
    'COMPARACION_FINAL' as seccion,
    'Ventas' as tipo,
    COUNT(*) as total_registros,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM ventas 
WHERE fecha::date = '2025-08-19'

UNION ALL

SELECT 
    'COMPARACION_FINAL' as seccion,
    'Movimientos de ventas' as tipo,
    COUNT(*) as total_registros,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
AND tipo = 'Ingreso';

-- ========================================
-- 5. RESUMEN DE LA CORRECCIÓN
-- ========================================

SELECT 
    'RESUMEN_CORRECCION' as seccion,
    'Movimientos de caja corregidos con horas exactas de ventas' as descripcion,
    'Los movimientos de ventas ahora tienen la misma hora que las ventas reales' as resultado;


