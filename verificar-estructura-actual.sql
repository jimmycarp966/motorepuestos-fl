-- Script para verificar la estructura actual de las tablas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual de ventas
SELECT 
    'ESTRUCTURA ACTUAL DE VENTAS' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventas'
ORDER BY ordinal_position;

-- 2. Verificar estructura actual de venta_items
SELECT 
    'ESTRUCTURA ACTUAL DE VENTA_ITEMS' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venta_items'
ORDER BY ordinal_position;

-- 3. Verificar si las columnas problemáticas existen
SELECT 
    'COLUMNAS PROBLEMÁTICAS EN VENTAS' as info,
    column_name,
    CASE 
        WHEN column_name = 'metodo_pago' THEN '❌ FALTA'
        WHEN column_name = 'tipo_precio' THEN '❌ FALTA'
        WHEN column_name = 'estado' THEN '❌ FALTA'
        WHEN column_name = 'updated_at' THEN '❌ FALTA'
        ELSE '✅ EXISTE'
    END as estado
FROM information_schema.columns 
WHERE table_name = 'ventas' 
    AND column_name IN ('metodo_pago', 'tipo_precio', 'estado', 'updated_at')
UNION ALL
SELECT 
    'metodo_pago' as info,
    'metodo_pago' as column_name,
    'NO EXISTE' as estado
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ventas' AND column_name = 'metodo_pago'
)
UNION ALL
SELECT 
    'tipo_precio' as info,
    'tipo_precio' as column_name,
    'NO EXISTE' as estado
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ventas' AND column_name = 'tipo_precio'
)
UNION ALL
SELECT 
    'estado' as info,
    'estado' as column_name,
    'NO EXISTE' as estado
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ventas' AND column_name = 'estado'
)
UNION ALL
SELECT 
    'updated_at' as info,
    'updated_at' as column_name,
    'NO EXISTE' as estado
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ventas' AND column_name = 'updated_at'
);

-- 4. Verificar datos existentes
SELECT 
    'DATOS EXISTENTES' as info,
    'ventas' as tabla,
    COUNT(*) as registros
FROM ventas
UNION ALL
SELECT 
    'DATOS EXISTENTES' as info,
    'venta_items' as tabla,
    COUNT(*) as registros
FROM venta_items;
