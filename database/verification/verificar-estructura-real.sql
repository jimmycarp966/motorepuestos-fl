-- Script para verificar la estructura REAL de la tabla productos
-- Ejecutar primero para ver qué columnas existen

-- 1. Verificar columnas existentes en la tabla productos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 2. Verificar si existen otras tablas relacionadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%producto%';

-- 3. Verificar si hay datos en la tabla
SELECT COUNT(*) as total_registros FROM productos;

-- 4. Mostrar algunos registros de ejemplo (si existen)
SELECT * FROM productos LIMIT 5;

-- 5. Verificar restricciones y índices
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'productos';

-- 6. Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'productos';
