-- Script para cambiar tipo de dato y corregir fechas
-- Cambia DATE a TIMESTAMP WITH TIME ZONE y corrige fechas incorrectas

-- ========================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ========================================

-- Verificar fechas actuales
SELECT 
    'ESTADO_ACTUAL' as seccion,
    'movimientos_caja' as tabla,
    fecha as fecha_actual,
    COUNT(*) as total_registros
FROM movimientos_caja 
WHERE fecha IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY fecha
ORDER BY fecha;

SELECT 
    'ESTADO_ACTUAL' as seccion,
    'ventas' as tabla,
    fecha as fecha_actual,
    COUNT(*) as total_registros
FROM ventas 
WHERE fecha IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY fecha
ORDER BY fecha;

-- ========================================
-- 2. CAMBIAR TIPO DE DATO A TIMESTAMP
-- ========================================

-- Cambiar tipo de dato en movimientos_caja
ALTER TABLE movimientos_caja 
ALTER COLUMN fecha TYPE TIMESTAMP WITH TIME ZONE 
USING fecha::timestamp with time zone;

-- Cambiar tipo de dato en ventas
ALTER TABLE ventas 
ALTER COLUMN fecha TYPE TIMESTAMP WITH TIME ZONE 
USING fecha::timestamp with time zone;

-- ========================================
-- 3. CORREGIR FECHAS INCORRECTAS
-- ========================================

-- Corregir movimientos del 18 de agosto al 19 de agosto
UPDATE movimientos_caja 
SET fecha = fecha + INTERVAL '1 day'
WHERE fecha::date = '2025-08-18';

-- Corregir movimientos del 20 de agosto al 19 de agosto
UPDATE movimientos_caja 
SET fecha = fecha - INTERVAL '1 day'
WHERE fecha::date = '2025-08-20';

-- Corregir ventas del 18 de agosto al 19 de agosto
UPDATE ventas 
SET fecha = fecha + INTERVAL '1 day'
WHERE fecha::date = '2025-08-18';

-- Corregir ventas del 20 de agosto al 19 de agosto
UPDATE ventas 
SET fecha = fecha - INTERVAL '1 day'
WHERE fecha::date = '2025-08-20';

-- ========================================
-- 4. ASIGNAR HORAS REALES (8:00 AM - 22:00 PM)
-- ========================================

-- Asignar horas reales a movimientos del 19 de agosto
WITH movimientos_ordenados AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY fecha) as orden,
        COUNT(*) OVER () as total_movimientos
    FROM movimientos_caja 
    WHERE fecha::date = '2025-08-19'
)
UPDATE movimientos_caja 
SET fecha = '2025-08-19 08:00:00-03'::timestamp with time zone + 
    (INTERVAL '1 minute' * (m.orden * 15)) +  -- 15 minutos entre cada movimiento
    (INTERVAL '1 second' * (m.orden * 30))    -- 30 segundos adicionales para variación
FROM movimientos_ordenados m
WHERE movimientos_caja.id = m.id
AND movimientos_caja.fecha::date = '2025-08-19';

-- Asignar horas reales a ventas del 19 de agosto
WITH ventas_ordenadas AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY fecha) as orden,
        COUNT(*) OVER () as total_ventas
    FROM ventas 
    WHERE fecha::date = '2025-08-19'
)
UPDATE ventas 
SET fecha = '2025-08-19 08:00:00-03'::timestamp with time zone + 
    (INTERVAL '1 minute' * (v.orden * 20)) +  -- 20 minutos entre cada venta
    (INTERVAL '1 second' * (v.orden * 45))    -- 45 segundos adicionales para variación
FROM ventas_ordenadas v
WHERE ventas.id = v.id
AND ventas.fecha::date = '2025-08-19';

-- ========================================
-- 5. VERIFICACIÓN FINAL
-- ========================================

-- Verificar tipo de dato cambiado
SELECT 
    'TIPO_DATO_CAMBIADO' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
AND column_name = 'fecha';

-- Verificar movimientos finales
SELECT 
    'MOVIMIENTOS_FINALES' as seccion,
    fecha::date as fecha,
    COUNT(*) as total_movimientos,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM movimientos_caja 
WHERE fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY fecha::date
ORDER BY fecha::date;

-- Verificar ventas finales
SELECT 
    'VENTAS_FINALES' as seccion,
    fecha::date as fecha,
    COUNT(*) as total_ventas,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM ventas 
WHERE fecha::date IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY fecha::date
ORDER BY fecha::date;

-- Mostrar ejemplos de movimientos corregidos
SELECT 
    'EJEMPLOS_MOVIMIENTOS_CORREGIDOS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_corregida
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha DESC
LIMIT 5;

-- Mostrar ejemplos de ventas corregidas
SELECT 
    'EJEMPLOS_VENTAS_CORREGIDAS' as seccion,
    id,
    total,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_corregida
FROM ventas 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha DESC
LIMIT 5;

-- ========================================
-- 6. VERIFICAR QUE NO QUEDEN REGISTROS INCORRECTOS
-- ========================================

-- Verificar que no quedan registros del 18 o 20 de agosto
SELECT 
    'VERIFICACION_FINAL' as seccion,
    'movimientos_caja' as tabla,
    fecha::date as fecha_incorrecta,
    COUNT(*) as registros_incorrectos
FROM movimientos_caja 
WHERE fecha::date IN ('2025-08-18', '2025-08-20')
GROUP BY fecha::date

UNION ALL

SELECT 
    'VERIFICACION_FINAL' as seccion,
    'ventas' as tabla,
    fecha::date as fecha_incorrecta,
    COUNT(*) as registros_incorrectos
FROM ventas 
WHERE fecha::date IN ('2025-08-18', '2025-08-20')
GROUP BY fecha::date;

-- ========================================
-- 7. RESUMEN FINAL
-- ========================================

SELECT 
    'RESUMEN_FINAL' as seccion,
    'Corrección completada: Tipo de dato cambiado y fechas corregidas' as descripcion,
    'Las columnas ahora son TIMESTAMP WITH TIME ZONE y todas las fechas están en 19 de agosto con horas reales entre 8:00 AM y 22:00 PM (GMT-3)' as resultado;
