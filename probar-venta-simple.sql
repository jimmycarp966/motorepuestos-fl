-- Script para probar una venta simple
-- Ejecutar en Supabase SQL Editor después de actualizar-ventas.sql

-- 1. Verificar que las columnas existen
SELECT 
    'ventas' as tabla,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'ventas' 
    AND column_name IN ('metodo_pago', 'tipo_precio', 'estado')
ORDER BY column_name;

SELECT 
    'venta_items' as tabla,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'venta_items' 
    AND column_name = 'tipo_precio';

-- 2. Verificar datos de prueba
SELECT 
    'empleados' as tabla,
    COUNT(*) as total
FROM empleados
WHERE activo = true
UNION ALL
SELECT 
    'productos' as tabla,
    COUNT(*) as total
FROM productos
WHERE activo = true AND stock > 0
UNION ALL
SELECT 
    'clientes' as tabla,
    COUNT(*) as total
FROM clientes
WHERE activo = true;

-- 3. Insertar venta de prueba
WITH venta_insertada AS (
    INSERT INTO ventas (
        cliente_id,
        empleado_id,
        total,
        metodo_pago,
        tipo_precio,
        estado,
        fecha
    )
    SELECT 
        c.id as cliente_id,
        e.id as empleado_id,
        150.00 as total,
        'efectivo' as metodo_pago,
        'minorista' as tipo_precio,
        'completada' as estado,
        NOW() as fecha
    FROM empleados e
    CROSS JOIN clientes c
    WHERE e.rol = 'Administrador' 
        AND c.activo = true
    LIMIT 1
    RETURNING id, total
),
item_insertado AS (
    INSERT INTO venta_items (
        venta_id,
        producto_id,
        cantidad,
        precio_unitario,
        subtotal,
        tipo_precio
    )
    SELECT 
        v.id as venta_id,
        p.id as producto_id,
        2 as cantidad,
        75.00 as precio_unitario,
        150.00 as subtotal,
        'minorista' as tipo_precio
    FROM venta_insertada v
    CROSS JOIN productos p
    WHERE p.activo = true AND p.stock >= 2
    LIMIT 1
    RETURNING venta_id, producto_id, cantidad
)
SELECT 
    'Venta de prueba insertada' as resultado,
    v.id as venta_id,
    v.total,
    i.producto_id,
    i.cantidad
FROM venta_insertada v
LEFT JOIN item_insertado i ON v.id = i.venta_id;

-- 4. Verificar la venta insertada
SELECT 
    v.*,
    c.nombre as cliente_nombre,
    e.nombre as empleado_nombre
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN empleados e ON v.empleado_id = e.id
ORDER BY v.created_at DESC
LIMIT 3;

-- 5. Verificar items de la venta
SELECT 
    vi.*,
    p.nombre as producto_nombre
FROM venta_items vi
LEFT JOIN productos p ON vi.producto_id = p.id
ORDER BY vi.created_at DESC
LIMIT 5;

-- 6. Verificar que se registró en movimientos_caja
SELECT 
    m.*,
    e.nombre as empleado_nombre
FROM movimientos_caja m
LEFT JOIN empleados e ON m.empleado_id = e.id
WHERE m.concepto LIKE '%Venta%'
ORDER BY m.created_at DESC
LIMIT 5;
