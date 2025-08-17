-- Script para investigar la batería Moura
-- Incluyendo todas las columnas disponibles

-- 1. Buscar en productos (por nombre y código)
SELECT 
    'BUSQUEDA EN PRODUCTOS' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo,
    created_at
FROM productos 
WHERE 
    LOWER(nombre) LIKE '%moura%' OR 
    LOWER(codigo_sku) LIKE '%moura%' OR
    LOWER(nombre) LIKE '%bateria%' OR
    LOWER(nombre) LIKE '%batería%'
ORDER BY created_at DESC;

-- 2. Buscar en ventas (por items que contengan Moura)
SELECT 
    'BUSQUEDA EN VENTAS' as tipo,
    v.id as venta_id,
    v.fecha,
    v.total,
    v.metodo_pago,
    v.tipo_precio,
    v.estado,
    v.created_at,
    vi.cantidad,
    vi.precio_unitario,
    vi.subtotal,
    vi.tipo_precio as item_tipo_precio,
    p.nombre as producto_nombre,
    p.codigo_sku as producto_sku,
    p.stock as stock_actual
FROM ventas v
JOIN venta_items vi ON v.id = vi.venta_id
JOIN productos p ON vi.producto_id = p.id
WHERE 
    LOWER(p.nombre) LIKE '%moura%' OR 
    LOWER(p.codigo_sku) LIKE '%moura%' OR
    LOWER(p.nombre) LIKE '%bateria%' OR
    LOWER(p.nombre) LIKE '%batería%'
ORDER BY v.created_at DESC;

-- 3. Buscar en movimientos de caja relacionados con ventas
SELECT 
    'BUSQUEDA EN MOVIMIENTOS CAJA' as tipo,
    id,
    fecha,
    tipo,
    concepto,
    monto,
    metodo_pago,
    created_at
FROM movimientos_caja 
WHERE 
    concepto LIKE '%moura%' OR
    concepto LIKE '%bateria%' OR
    concepto LIKE '%batería%' OR
    concepto LIKE '%venta%'
ORDER BY created_at DESC;

-- 4. Verificar si hay productos eliminados (soft delete)
SELECT 
    'PRODUCTOS CON ACTIVO = FALSE' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE activo = false
ORDER BY created_at DESC;

-- 5. Buscar productos con nombres similares
SELECT 
    'PRODUCTOS SIMILARES' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo
FROM productos 
WHERE 
    LOWER(nombre) LIKE '%bater%' OR
    LOWER(nombre) LIKE '%moura%' OR
    LOWER(codigo_sku) LIKE '%bater%' OR
    LOWER(codigo_sku) LIKE '%moura%'
ORDER BY nombre;

-- 6. Verificar el historial completo de ventas recientes
SELECT 
    'HISTORIAL VENTAS RECIENTES' as tipo,
    v.id,
    v.fecha,
    v.total,
    v.metodo_pago,
    v.tipo_precio,
    v.estado,
    v.created_at,
    COUNT(vi.id) as cantidad_items
FROM ventas v
LEFT JOIN venta_items vi ON v.id = vi.venta_id
GROUP BY v.id, v.fecha, v.total, v.metodo_pago, v.tipo_precio, v.estado, v.created_at
ORDER BY v.created_at DESC
LIMIT 10;

-- 7. Verificar productos con stock 0 o negativo
SELECT 
    'PRODUCTOS SIN STOCK' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE stock <= 0
ORDER BY stock ASC, nombre;
