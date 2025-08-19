-- Script para verificar exactamente qué columnas existen en la tabla productos
-- Ejecutar este script en Supabase para ver las columnas exactas

-- 1. Mostrar estructura completa de la tabla productos
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

-- 3. Verificar columnas específicas que podrían existir
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
AND (
    column_name ILIKE '%precio%' 
    OR column_name ILIKE '%costo%' 
    OR column_name ILIKE '%stock%' 
    OR column_name ILIKE '%inventario%'
    OR column_name ILIKE '%codigo%'
    OR column_name ILIKE '%sku%'
    OR column_name ILIKE '%nombre%'
    OR column_name ILIKE '%descripcion%'
    OR column_name ILIKE '%categoria%'
    OR column_name ILIKE '%unidad%'
    OR column_name ILIKE '%activo%'
)
ORDER BY column_name;

