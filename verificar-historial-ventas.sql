-- Script para verificar el historial completo de ventas
-- Verificar si hay datos de ventas que no se están mostrando

-- 1. Verificar si hay ventas en la base de datos
SELECT 
    'RESUMEN VENTAS' as tipo,
    COUNT(*) as total_ventas,
    SUM(total) as total_monto,
    MIN(fecha) as primera_venta,
    MAX(fecha) as ultima_venta,
    COUNT(DISTINCT metodo_pago) as metodos_pago_utilizados
FROM ventas;

-- 2. Listar todas las ventas con sus items
SELECT 
    'VENTAS CON ITEMS' as tipo,
    v.id as venta_id,
    v.fecha,
    v.total,
    v.metodo_pago,
    v.tipo_precio,
    v.created_at,
    vi.cantidad,
    vi.precio_unitario,
    vi.subtotal,
    p.nombre as producto_nombre,
    p.codigo_sku as producto_sku,
    p.stock as stock_actual
FROM ventas v
JOIN venta_items vi ON v.id = vi.venta_id
JOIN productos p ON vi.producto_id = p.id
ORDER BY v.created_at DESC;

-- 3. Verificar movimientos de caja relacionados con ventas
SELECT 
    'MOVIMIENTOS CAJA VENTAS' as tipo,
    id,
    fecha,
    tipo,
    concepto,
    monto,
    metodo_pago,
    created_at
FROM movimientos_caja 
WHERE concepto LIKE '%Venta%' OR concepto LIKE '%venta%'
ORDER BY created_at DESC;

-- 4. Verificar si hay productos que fueron vendidos pero no aparecen
SELECT 
    'PRODUCTOS VENDIDOS' as tipo,
    p.id,
    p.nombre,
    p.codigo_sku,
    p.stock as stock_actual,
    COUNT(vi.id) as veces_vendido,
    SUM(vi.cantidad) as cantidad_total_vendida,
    SUM(vi.subtotal) as monto_total_vendido
FROM productos p
LEFT JOIN venta_items vi ON p.id = vi.producto_id
GROUP BY p.id, p.nombre, p.codigo_sku, p.stock
HAVING COUNT(vi.id) > 0
ORDER BY veces_vendido DESC;

-- 5. Verificar productos que no aparecen en ventas
SELECT 
    'PRODUCTOS SIN VENTAS' as tipo,
    p.id,
    p.nombre,
    p.codigo_sku,
    p.stock,
    p.activo,
    p.created_at
FROM productos p
LEFT JOIN venta_items vi ON p.id = vi.producto_id
WHERE vi.id IS NULL
ORDER BY p.nombre;

-- 6. Verificar si hay inconsistencias en los datos
SELECT 
    'VERIFICACION INTEGRIDAD' as tipo,
    'Ventas sin items' as problema,
    COUNT(*) as cantidad
FROM ventas v
LEFT JOIN venta_items vi ON v.id = vi.venta_id
WHERE vi.id IS NULL
UNION ALL
SELECT 
    'VERIFICACION INTEGRIDAD' as tipo,
    'Items sin venta' as problema,
    COUNT(*) as cantidad
FROM venta_items vi
LEFT JOIN ventas v ON vi.venta_id = v.id
WHERE v.id IS NULL;
