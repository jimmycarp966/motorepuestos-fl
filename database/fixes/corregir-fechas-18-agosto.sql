-- Script para corregir fechas del 18 de agosto que están incorrectas
-- Este script corrige los movimientos que muestran 18/08/2025 cuando deberían ser 19/08/2025

-- 1. Verificar movimientos del 18 de agosto antes de la corrección
SELECT 
    'ANTES_CORRECCION' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_movimientos_18_agosto,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = '2025-08-18';

-- 2. Mostrar ejemplos de fechas actuales del 18 de agosto
SELECT 
    'EJEMPLOS_18_AGOSTO' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_actual,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM movimientos_caja 
WHERE fecha::date = '2025-08-18'
ORDER BY fecha DESC
LIMIT 5;

-- 3. CORRECCIÓN: Cambiar fecha del 18 de agosto al 19 de agosto
-- Mantener la misma hora pero cambiar la fecha
UPDATE movimientos_caja 
SET fecha = fecha + INTERVAL '1 day'
WHERE fecha::date = '2025-08-18';

-- 4. Verificar movimientos del 19 de agosto después de la corrección
SELECT 
    'DESPUES_CORRECCION' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as total_movimientos_19_agosto,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19';

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
WHERE fecha::date = '2025-08-19'
ORDER BY fecha DESC
LIMIT 5;

-- 6. Verificar que no quedan movimientos del 18 de agosto
SELECT 
    'VERIFICACION_FINAL' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as movimientos_18_agosto_restantes
FROM movimientos_caja 
WHERE fecha::date = '2025-08-18';

-- 7. Resumen de la corrección
SELECT 
    'RESUMEN_CORRECCION' as seccion,
    'Movimientos del 18 de agosto corregidos al 19 de agosto' as descripcion,
    COUNT(*) as total_corregidos
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19';
