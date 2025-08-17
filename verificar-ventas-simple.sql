-- Script simple para verificar y crear datos de ventas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si hay ventas
SELECT 'Ventas existentes' as status, COUNT(*) as total FROM ventas;

-- 2. Verificar estructura de una venta existente
SELECT 
    id,
    cliente_id,
    empleado_id,
    total,
    fecha,
    created_at
FROM ventas 
LIMIT 1;

-- 3. Verificar relaciones
SELECT 
    v.id,
    v.total,
    v.fecha,
    c.nombre as cliente_nombre,
    e.nombre as empleado_nombre
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN empleados e ON v.empleado_id = e.id
LIMIT 3;

-- 4. Crear datos de prueba si no hay suficientes ventas
INSERT INTO ventas (id, cliente_id, empleado_id, total, fecha, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    c.id as cliente_id,
    e.id as empleado_id,
    (random() * 300 + 50)::numeric(10,2) as total,
    NOW() - (random() * interval '14 days') as fecha,
    NOW() as created_at,
    NOW() as updated_at
FROM clientes c
CROSS JOIN empleados e
WHERE (SELECT COUNT(*) FROM ventas) < 5
LIMIT 2;

-- 5. Verificar resultado final
SELECT 'Resultado final' as status, COUNT(*) as total_ventas FROM ventas;
