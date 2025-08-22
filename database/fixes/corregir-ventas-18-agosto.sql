-- Script para corregir fechas de ventas del 18 de agosto que están incorrectas
-- Este script corrige las ventas que muestran 18/08/2025 cuando deberían ser 19/08/2025

-- 1. Verificar ventas del 18 de agosto antes de la corrección
SELECT 
    'ANTES_CORRECCION' as seccion,
    'ventas' as tabla,
    COUNT(*) as total_ventas_18_agosto,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM ventas 
WHERE fecha::date = '2025-08-18';

-- 2. Mostrar ejemplos de fechas actuales del 18 de agosto
SELECT 
    'EJEMPLOS_18_AGOSTO' as seccion,
    id,
    total,
    fecha as fecha_actual,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM ventas 
WHERE fecha::date = '2025-08-18'
ORDER BY fecha DESC
LIMIT 5;

-- 3. CORRECCIÓN: Cambiar fecha del 18 de agosto al 19 de agosto
-- Mantener la misma hora pero cambiar la fecha
UPDATE ventas 
SET fecha = fecha + INTERVAL '1 day'
WHERE fecha::date = '2025-08-18';

-- 4. Verificar ventas del 19 de agosto después de la corrección
SELECT 
    'DESPUES_CORRECCION' as seccion,
    'ventas' as tabla,
    COUNT(*) as total_ventas_19_agosto,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM ventas 
WHERE fecha::date = '2025-08-19';

-- 5. Mostrar ejemplos de fechas corregidas
SELECT 
    'EJEMPLOS_CORREGIDOS' as seccion,
    id,
    total,
    fecha as fecha_corregida,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM ventas 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha DESC
LIMIT 5;

-- 6. Verificar que no quedan ventas del 18 de agosto
SELECT 
    'VERIFICACION_FINAL' as seccion,
    'ventas' as tabla,
    COUNT(*) as ventas_18_agosto_restantes
FROM ventas 
WHERE fecha::date = '2025-08-18';

-- 7. Resumen de la corrección
SELECT 
    'RESUMEN_CORRECCION' as seccion,
    'Ventas del 18 de agosto corregidas al 19 de agosto' as descripcion,
    COUNT(*) as total_corregidas
FROM ventas 
WHERE fecha::date = '2025-08-19';


