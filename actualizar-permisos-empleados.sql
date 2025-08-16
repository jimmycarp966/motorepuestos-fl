-- Script para actualizar permisos de empleados existentes
-- Ejecutar en Supabase SQL Editor

-- Actualizar permisos de empleados existentes con permisos completos según su rol
UPDATE empleados 
SET permisos_modulos = CASE 
  WHEN rol = 'Administrador' THEN ARRAY['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario']::TEXT[]
  WHEN rol = 'Gerente' THEN ARRAY['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario']::TEXT[]
  WHEN rol = 'Vendedor' THEN ARRAY['dashboard', 'ventas', 'clientes', 'calendario']::TEXT[]
  WHEN rol = 'Técnico' THEN ARRAY['dashboard', 'productos', 'calendario']::TEXT[]
  WHEN rol = 'Almacén' THEN ARRAY['dashboard', 'productos', 'calendario']::TEXT[]
  WHEN rol = 'Cajero' THEN ARRAY['dashboard', 'ventas', 'caja', 'clientes', 'calendario']::TEXT[]
  ELSE ARRAY['dashboard']::TEXT[]
END
WHERE permisos_modulos = ARRAY['dashboard']::TEXT[];

-- Verificar que los cambios se aplicaron correctamente
SELECT 
  id,
  nombre,
  email,
  rol,
  salario,
  permisos_modulos,
  activo
FROM empleados
ORDER BY nombre;

-- Mostrar resumen de permisos por rol
SELECT 
  rol,
  COUNT(*) as cantidad_empleados,
  array_agg(DISTINCT permisos_modulos) as permisos_asignados
FROM empleados
WHERE activo = true
GROUP BY rol
ORDER BY rol;
