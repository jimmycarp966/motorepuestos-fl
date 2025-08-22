-- Script para consultar las ventas reales del día
-- Ver las horas exactas de las ventas registradas

-- ========================================
-- 1. CONSULTAR VENTAS DEL 19 DE AGOSTO
-- ========================================

-- Ver todas las ventas del 19 de agosto con hora exacta
SELECT 
    'VENTAS_19_AGOSTO' as seccion,
    id,
    total,
    fecha as fecha_completa,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    to_char(fecha, 'HH24:MI') as hora_exacta
FROM ventas 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha ASC;

-- ========================================
-- 2. CONSULTAR VENTAS DE OTROS DÍAS
-- ========================================

-- Ver ventas del 18 de agosto
SELECT 
    'VENTAS_18_AGOSTO' as seccion,
    id,
    total,
    fecha as fecha_completa,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    to_char(fecha, 'HH24:MI') as hora_exacta
FROM ventas 
WHERE fecha::date = '2025-08-18'
ORDER BY fecha ASC;

-- Ver ventas del 20 de agosto
SELECT 
    'VENTAS_20_AGOSTO' as seccion,
    id,
    total,
    fecha as fecha_completa,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    to_char(fecha, 'HH24:MI') as hora_exacta
FROM ventas 
WHERE fecha::date = '2025-08-20'
ORDER BY fecha ASC;

-- ========================================
-- 3. CONSULTAR MOVIMIENTOS DE CAJA ACTUALES
-- ========================================

-- Ver movimientos de caja del 19 de agosto
SELECT 
    'MOVIMIENTOS_19_AGOSTO' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_completa,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    to_char(fecha, 'HH24:MI') as hora_exacta
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
ORDER BY fecha ASC;

-- ========================================
-- 4. COMPARAR VENTAS CON MOVIMIENTOS
-- ========================================

-- Verificar si hay correspondencia entre ventas y movimientos
SELECT 
    'COMPARACION' as seccion,
    'Ventas del 19 de agosto' as tipo,
    COUNT(*) as total_registros,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM ventas 
WHERE fecha::date = '2025-08-19'

UNION ALL

SELECT 
    'COMPARACION' as seccion,
    'Movimientos del 19 de agosto' as tipo,
    COUNT(*) as total_registros,
    MIN(fecha) as hora_mas_antigua,
    MAX(fecha) as hora_mas_reciente
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19';

-- ========================================
-- 5. BUSCAR MOVIMIENTOS DE VENTAS
-- ========================================

-- Buscar movimientos que correspondan a ventas (tipo 'Ingreso')
SELECT 
    'MOVIMIENTOS_VENTAS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_completa,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada
FROM movimientos_caja 
WHERE fecha::date = '2025-08-19'
AND tipo = 'Ingreso'
ORDER BY fecha ASC;

-- ========================================
-- 6. RESUMEN PARA CORRECCIÓN
-- ========================================

SELECT 
    'RESUMEN_CORRECCION' as seccion,
    'Usar las horas exactas de las ventas para corregir los movimientos de caja' as instruccion,
    'Las ventas tienen la hora real, los movimientos deben coincidir' as explicacion;


