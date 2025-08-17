-- Verificación completa de la tabla ventas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'ventas' 
  AND table_schema = 'public';

-- 2. Verificar estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si hay datos
SELECT 
  COUNT(*) as total_ventas,
  COUNT(CASE WHEN created_at IS NOT NULL THEN 1 END) as con_fecha,
  COUNT(CASE WHEN total IS NOT NULL THEN 1 END) as con_total
FROM ventas;

-- 4. Verificar datos de muestra
SELECT 
  id,
  fecha,
  total,
  cliente_id,
  empleado_id,
  created_at,
  updated_at
FROM ventas 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ventas';

-- 6. Verificar permisos del usuario actual
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'ventas' 
  AND table_schema = 'public';
