-- Script para verificar la estructura real de la tabla productos
-- Ejecutar este script en Supabase para ver las columnas exactas

-- 1. Mostrar estructura de la tabla productos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Mostrar algunos registros de ejemplo para ver la estructura
SELECT * FROM productos LIMIT 3;

-- 3. Verificar si existe la columna 'sku' o similar
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
AND column_name ILIKE '%sku%' OR column_name ILIKE '%codigo%' OR column_name ILIKE '%id%';

-- 4. Verificar columnas de precios
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
AND column_name ILIKE '%precio%' OR column_name ILIKE '%costo%';

-- 5. Verificar columnas de stock
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
AND column_name ILIKE '%stock%' OR column_name ILIKE '%inventario%';
