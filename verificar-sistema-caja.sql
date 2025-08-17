-- Script para verificar el sistema completo de caja
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de tablas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name IN ('movimientos_caja', 'ventas', 'venta_items', 'empleados', 'productos', 'clientes')
ORDER BY table_name;

-- 2. Verificar políticas de movimientos_caja
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'movimientos_caja';

-- 3. Verificar datos de empleados (necesarios para movimientos)
SELECT 
  id,
  nombre,
  email,
  rol,
  activo
FROM empleados
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar movimientos de caja existentes
SELECT 
  m.*,
  e.nombre as empleado_nombre
FROM movimientos_caja m
LEFT JOIN empleados e ON m.empleado_id = e.id
ORDER BY m.created_at DESC
LIMIT 10;

-- 5. Calcular saldo actual
SELECT 
  SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as saldo_actual,
  COUNT(*) as total_movimientos,
  COUNT(CASE WHEN tipo = 'ingreso' THEN 1 END) as total_ingresos,
  COUNT(CASE WHEN tipo = 'egreso' THEN 1 END) as total_egresos
FROM movimientos_caja;

-- 6. Verificar movimientos de hoy
SELECT 
  tipo,
  COUNT(*) as cantidad,
  SUM(monto) as total
FROM movimientos_caja 
WHERE DATE(fecha) = CURRENT_DATE
GROUP BY tipo;

-- 7. Verificar ventas recientes
SELECT 
  v.*,
  c.nombre as cliente_nombre,
  e.nombre as empleado_nombre
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN empleados e ON v.empleado_id = e.id
ORDER BY v.created_at DESC
LIMIT 5;

-- 8. Verificar productos con stock
SELECT 
  nombre,
  stock,
  precio_minorista,
  precio_mayorista,
  activo
FROM productos
WHERE activo = true
ORDER BY stock ASC
LIMIT 10;

-- 9. Insertar movimiento de prueba si no hay datos
INSERT INTO movimientos_caja (tipo, monto, concepto, empleado_id) 
SELECT 
  'ingreso' as tipo,
  1000.00 as monto,
  'Prueba de sistema - Apertura inicial' as concepto,
  e.id as empleado_id
FROM empleados e
WHERE e.rol = 'Administrador'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 10. Verificar resultado final
SELECT 
  'Sistema de Caja' as sistema,
  (SELECT COUNT(*) FROM movimientos_caja) as movimientos,
  (SELECT COUNT(*) FROM ventas) as ventas,
  (SELECT COUNT(*) FROM productos WHERE activo = true) as productos_activos,
  (SELECT COUNT(*) FROM empleados WHERE activo = true) as empleados_activos,
  (SELECT COUNT(*) FROM clientes WHERE activo = true) as clientes_activos;
