-- Script de diagnóstico y creación de datos de prueba para ventas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla ventas existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'ventas' 
AND table_schema = 'public';

-- 2. Verificar estructura de la tabla ventas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si hay datos en ventas
SELECT COUNT(*) as total_ventas FROM ventas;

-- 4. Verificar relaciones
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'ventas';

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

-- 6. Crear datos de prueba si no existen ventas
INSERT INTO ventas (id, cliente_id, empleado_id, total, fecha, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    c.id as cliente_id,
    e.id as empleado_id,
    (random() * 1000 + 100)::numeric(10,2) as total,
    NOW() - (random() * interval '30 days') as fecha,
    NOW() as created_at,
    NOW() as updated_at
FROM clientes c
CROSS JOIN empleados e
WHERE NOT EXISTS (SELECT 1 FROM ventas LIMIT 1)
LIMIT 5;

-- 7. Crear items de venta para las ventas creadas
INSERT INTO venta_items (id, venta_id, producto_id, cantidad, precio_unitario, subtotal, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    v.id as venta_id,
    p.id as producto_id,
    (random() * 5 + 1)::integer as cantidad,
    p.precio_minorista as precio_unitario,
    (p.precio_minorista * (random() * 5 + 1)::integer)::numeric(10,2) as subtotal,
    NOW() as created_at,
    NOW() as updated_at
FROM ventas v
CROSS JOIN productos p
WHERE NOT EXISTS (SELECT 1 FROM venta_items LIMIT 1)
LIMIT 10;

-- 8. Verificar datos creados
SELECT 
    v.id,
    v.fecha,
    v.total,
    c.nombre as cliente_nombre,
    e.nombre as empleado_nombre,
    COUNT(vi.id) as items_count
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN empleados e ON v.empleado_id = e.id
LEFT JOIN venta_items vi ON v.id = vi.venta_id
GROUP BY v.id, v.fecha, v.total, c.nombre, e.nombre
ORDER BY v.fecha DESC;

-- 9. Verificar permisos del usuario actual
SELECT 
    current_user,
    session_user,
    current_database(),
    current_schema();

-- 10. Verificar si el usuario puede acceder a las tablas
SELECT 
    table_name,
    has_table_privilege(current_user, table_name, 'SELECT') as can_select,
    has_table_privilege(current_user, table_name, 'INSERT') as can_insert,
    has_table_privilege(current_user, table_name, 'UPDATE') as can_update,
    has_table_privilege(current_user, table_name, 'DELETE') as can_delete
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ventas', 'venta_items', 'clientes', 'empleados', 'productos');
