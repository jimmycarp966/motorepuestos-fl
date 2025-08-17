-- Script para verificar la estructura actual de las tablas
-- Verificar qué columnas existen actualmente

-- 1. Verificar estructura de la tabla ventas
SELECT 
    'ESTRUCTURA VENTAS' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;

-- 2. Verificar estructura de la tabla venta_items
SELECT 
    'ESTRUCTURA VENTA_ITEMS' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venta_items' 
ORDER BY ordinal_position;

-- 3. Verificar estructura de la tabla movimientos_caja
SELECT 
    'ESTRUCTURA MOVIMIENTOS_CAJA' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
ORDER BY ordinal_position;

-- 4. Verificar estructura de la tabla productos
SELECT 
    'ESTRUCTURA PRODUCTOS' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 5. Verificar si existen las columnas que necesitamos
SELECT 
    'COLUMNAS FALTANTES' as tipo,
    'ventas.metodo_pago' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'metodo_pago'
    ) as existe
UNION ALL
SELECT 
    'COLUMNAS FALTANTES' as tipo,
    'ventas.tipo_precio' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'tipo_precio'
    ) as existe
UNION ALL
SELECT 
    'COLUMNAS FALTANTES' as tipo,
    'ventas.estado' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'estado'
    ) as existe
UNION ALL
SELECT 
    'COLUMNAS FALTANTES' as tipo,
    'venta_items.tipo_precio' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venta_items' AND column_name = 'tipo_precio'
    ) as existe;
