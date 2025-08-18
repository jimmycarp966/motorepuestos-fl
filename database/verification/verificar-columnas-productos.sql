-- Script para verificar exactamente qué columnas existen en la tabla productos

-- 1. Verificar todas las columnas existentes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 2. Verificar si existe columna de precio con diferentes nombres
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name LIKE '%precio%'
ORDER BY column_name;

-- 3. Verificar si existe columna de costo
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name LIKE '%costo%'
ORDER BY column_name;

-- 4. Mostrar estructura completa
SELECT 
    'Estructura completa de tabla productos:' as info,
    COUNT(*) as total_columnas
FROM information_schema.columns 
WHERE table_name = 'productos';
