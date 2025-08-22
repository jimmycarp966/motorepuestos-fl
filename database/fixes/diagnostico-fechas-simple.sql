-- Script de diagnóstico simple para ver el estado actual de fechas
-- Funciona con columnas de tipo DATE

-- ========================================
-- 1. VERIFICAR TIPO DE DATO DE LAS COLUMNAS
-- ========================================

-- Verificar el tipo de dato de la columna fecha en movimientos_caja
SELECT 
    'TIPO_DATO_MOVIMIENTOS' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
AND column_name = 'fecha';

-- Verificar el tipo de dato de la columna fecha en ventas
SELECT 
    'TIPO_DATO_VENTAS' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventas' 
AND column_name = 'fecha';

-- ========================================
-- 2. DIAGNÓSTICO DE FECHAS
-- ========================================

-- Ver todas las fechas únicas en movimientos_caja
SELECT 
    'FECHAS_UNICAS_MOVIMIENTOS' as seccion,
    fecha as fecha,
    COUNT(*) as total_registros
FROM movimientos_caja 
GROUP BY fecha
ORDER BY fecha DESC
LIMIT 10;

-- Ver todas las fechas únicas en ventas
SELECT 
    'FECHAS_UNICAS_VENTAS' as seccion,
    fecha as fecha,
    COUNT(*) as total_registros
FROM ventas 
GROUP BY fecha
ORDER BY fecha DESC
LIMIT 10;

-- ========================================
-- 3. VERIFICAR FECHAS ESPECÍFICAS
-- ========================================

-- Verificar movimientos del 18, 19 y 20 de agosto
SELECT 
    'MOVIMIENTOS_18_19_20' as seccion,
    fecha as fecha,
    COUNT(*) as total_registros
FROM movimientos_caja 
WHERE fecha IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY fecha
ORDER BY fecha;

-- Verificar ventas del 18, 19 y 20 de agosto
SELECT 
    'VENTAS_18_19_20' as seccion,
    fecha as fecha,
    COUNT(*) as total_registros
FROM ventas 
WHERE fecha IN ('2025-08-18', '2025-08-19', '2025-08-20')
GROUP BY fecha
ORDER BY fecha;

-- ========================================
-- 4. EJEMPLOS DE REGISTROS
-- ========================================

-- Mostrar ejemplos de movimientos del 18, 19 y 20 de agosto
SELECT 
    'EJEMPLOS_MOVIMIENTOS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha
FROM movimientos_caja 
WHERE fecha IN ('2025-08-18', '2025-08-19', '2025-08-20')
ORDER BY fecha DESC, id DESC
LIMIT 10;

-- Mostrar ejemplos de ventas del 18, 19 y 20 de agosto
SELECT 
    'EJEMPLOS_VENTAS' as seccion,
    id,
    total,
    fecha as fecha
FROM ventas 
WHERE fecha IN ('2025-08-18', '2025-08-19', '2025-08-20')
ORDER BY fecha DESC, id DESC
LIMIT 10;

-- ========================================
-- 5. RESUMEN DEL PROBLEMA
-- ========================================

SELECT 
    'RESUMEN_PROBLEMA' as seccion,
    'La columna fecha es de tipo DATE, no TIMESTAMP' as problema,
    'Por eso no se pueden extraer las horas' as explicacion,
    'Necesitamos cambiar el tipo de dato o usar otra estrategia' as solucion;


