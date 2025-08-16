-- Script para mostrar EXACTAMENTE qué dice la constraint de rol
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la constraint de rol específicamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname = 'empleados_rol_check';

-- 2. Verificar si hay empleados existentes para ver qué roles usan
SELECT 
    id,
    nombre,
    email,
    rol,
    activo
FROM empleados 
LIMIT 10;

-- 3. Verificar todos los roles únicos que existen
SELECT DISTINCT rol FROM empleados ORDER BY rol;
