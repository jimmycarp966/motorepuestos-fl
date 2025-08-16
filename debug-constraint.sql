-- Script para debuggear la constraint de rol
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la constraint de rol específicamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname = 'empleados_rol_check';

-- 2. Verificar si hay empleados existentes
SELECT 
    id,
    nombre,
    email,
    rol,
    activo
FROM empleados 
LIMIT 5;

-- 3. Probar con valores comunes uno por uno
-- Intentar con 'empleado'
BEGIN;
INSERT INTO empleados (
    id,
    nombre,
    email,
    rol,
    activo,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Test Empleado',
    'test-empleado@test.com',
    'empleado',
    true,
    NOW(),
    NOW()
);
ROLLBACK;

-- Si llegamos aquí, 'empleado' funciona
-- Si no, el error nos dirá qué valores están permitidos
