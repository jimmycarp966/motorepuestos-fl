-- Script para verificar EXACTAMENTE qué valores están permitidos en la constraint de rol
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la constraint de rol
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname LIKE '%rol%';

-- 2. Verificar si hay empleados existentes para ver qué roles usan
SELECT DISTINCT rol FROM empleados;

-- 3. Verificar la estructura completa de la tabla empleados
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empleados' 
ORDER BY ordinal_position;
