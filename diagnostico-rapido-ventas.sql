-- Diagnóstico rápido de ventas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT 'Tabla ventas existe' as status, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_name = 'ventas' AND table_schema = 'public';

-- 2. Verificar estructura básica
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ventas' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si hay datos
SELECT 'Datos en ventas' as status, COUNT(*) as total_ventas FROM ventas;

-- 4. Verificar relaciones
SELECT 'Relaciones' as status,
       (SELECT COUNT(*) FROM clientes) as total_clientes,
       (SELECT COUNT(*) FROM empleados) as total_empleados,
       (SELECT COUNT(*) FROM productos) as total_productos;

-- 5. Verificar políticas RLS
SELECT 'Políticas RLS' as status, COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'ventas';

-- 6. Crear datos de prueba si no hay ventas
INSERT INTO ventas (id, cliente_id, empleado_id, total, fecha, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    c.id as cliente_id,
    e.id as empleado_id,
    (random() * 500 + 100)::numeric(10,2) as total,
    NOW() - (random() * interval '7 days') as fecha,
    NOW() as created_at,
    NOW() as updated_at
FROM clientes c
CROSS JOIN empleados e
WHERE NOT EXISTS (SELECT 1 FROM ventas LIMIT 1)
LIMIT 3;

-- 7. Verificar resultado final
SELECT 'Resultado final' as status, COUNT(*) as ventas_totales FROM ventas;
