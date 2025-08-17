-- Script para insertar una venta de prueba
-- Ejecutar en el SQL Editor de Supabase

-- 1. Obtener un empleado para la venta
DO $$
DECLARE
    empleado_id UUID;
    producto_id UUID;
    venta_id UUID;
BEGIN
    -- Obtener el primer empleado
    SELECT id INTO empleado_id FROM empleados LIMIT 1;
    
    -- Obtener el primer producto
    SELECT id INTO producto_id FROM productos LIMIT 1;
    
    -- Insertar venta de prueba
    INSERT INTO ventas (cliente_id, empleado_id, total, fecha, created_at, updated_at)
    VALUES (NULL, empleado_id, 150.00, NOW(), NOW(), NOW())
    RETURNING id INTO venta_id;
    
    -- Insertar item de venta
    INSERT INTO venta_items (venta_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
    VALUES (venta_id, producto_id, 2, 75.00, 150.00, NOW());
    
    RAISE NOTICE 'Venta de prueba creada con ID: %', venta_id;
    
    -- Mostrar la venta creada
    SELECT 
        v.id as venta_id,
        v.total,
        v.fecha,
        e.nombre as empleado,
        p.nombre as producto,
        vi.cantidad,
        vi.precio_unitario
    FROM ventas v
    JOIN empleados e ON v.empleado_id = e.id
    JOIN venta_items vi ON v.id = vi.venta_id
    JOIN productos p ON vi.producto_id = p.id
    WHERE v.id = venta_id;
    
END $$;

-- 2. Verificar que la venta se creó correctamente
SELECT 
    v.id,
    v.total,
    v.fecha,
    e.nombre as empleado,
    COUNT(vi.id) as total_items
FROM ventas v
LEFT JOIN empleados e ON v.empleado_id = e.id
LEFT JOIN venta_items vi ON v.id = vi.venta_id
GROUP BY v.id, v.total, v.fecha, e.nombre
ORDER BY v.created_at DESC
LIMIT 5;
