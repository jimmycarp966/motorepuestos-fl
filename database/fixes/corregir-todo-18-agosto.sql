-- Script completo para corregir fechas del 18 de agosto
-- Corrige tanto movimientos_caja como ventas que muestran fecha incorrecta

-- ========================================
-- 1. CORRECCIÓN DE MOVIMIENTOS DE CAJA
-- ========================================

-- Verificar movimientos del 18 de agosto
SELECT 
    'MOVIMIENTOS_ANTES' as seccion,
    COUNT(*) as total_movimientos_18_agosto
FROM movimientos_caja 
WHERE fecha::date = '2025-08-18';

-- Corregir movimientos del 18 de agosto al 19 de agosto
UPDATE movimientos_caja 
SET fecha = fecha + INTERVAL '1 day'
WHERE fecha::date = '2025-08-18';

-- Verificar corrección de movimientos
SELECT 
    'MOVIMIENTOS_DESPUES' as seccion,
    COUNT(*) as total_movimientos_19_agosto
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19';

-- ========================================
-- 2. CORRECCIÓN DE VENTAS
-- ========================================

-- Verificar ventas del 18 de agosto
SELECT 
    'VENTAS_ANTES' as seccion,
    COUNT(*) as total_ventas_18_agosto
FROM ventas 
WHERE fecha::date = '2025-08-18';

-- Corregir ventas del 18 de agosto al 19 de agosto
UPDATE ventas 
SET fecha = fecha + INTERVAL '1 day'
WHERE fecha::date = '2025-08-18';

-- Verificar corrección de ventas
SELECT 
    'VENTAS_DESPUES' as seccion,
    COUNT(*) as total_ventas_19_agosto
FROM ventas 
WHERE fecha::date = '2025-08-19';

-- ========================================
-- 3. VERIFICACIÓN FINAL
-- ========================================

-- Verificar que no quedan registros del 18 de agosto
SELECT 
    'VERIFICACION_FINAL' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as registros_18_agosto
FROM movimientos_caja 
WHERE fecha::date = '2025-08-18'

UNION ALL

SELECT 
    'VERIFICACION_FINAL' as seccion,
    'ventas' as tabla,
    COUNT(*) as registros_18_agosto
FROM ventas 
WHERE fecha::date = '2025-08-18';

-- Mostrar ejemplos de fechas corregidas
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
LIMIT 3;

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
    'Corrección completada: 18 de agosto → 19 de agosto' as descripcion,
    'Todos los registros del 18 de agosto han sido corregidos al 19 de agosto' as resultado;
