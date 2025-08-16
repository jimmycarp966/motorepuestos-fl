-- Script para mostrar EXACTAMENTE qué dice la constraint de rol
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar TODAS las constraints de la tabla empleados
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass;

-- 2. Verificar si hay empleados existentes
SELECT 
    id,
    nombre,
    email,
    rol,
    activo
FROM empleados 
LIMIT 5;

-- 3. Verificar todos los roles únicos que existen
SELECT DISTINCT rol FROM empleados ORDER BY rol;

-- 4. Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empleados' 
ORDER BY ordinal_position;
