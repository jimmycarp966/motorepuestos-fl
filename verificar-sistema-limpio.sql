-- Script para verificar que el sistema esté limpio y funcionando
-- Después de la limpieza

-- 1. Verificar estado general del sistema
SELECT 
    'ESTADO GENERAL' as tipo,
    'ventas' as tabla,
    COUNT(*) as registros
FROM ventas
UNION ALL
SELECT 
    'ESTADO GENERAL' as tipo,
    'venta_items' as tabla,
    COUNT(*) as registros
FROM venta_items
UNION ALL
SELECT 
    'ESTADO GENERAL' as tipo,
    'movimientos_caja' as tabla,
    COUNT(*) as registros
FROM movimientos_caja
UNION ALL
SELECT 
    'ESTADO GENERAL' as tipo,
    'productos' as tabla,
    COUNT(*) as registros
FROM productos;

-- 2. Verificar productos activos disponibles
SELECT 
    'PRODUCTOS ACTIVOS' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as con_stock,
    SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as sin_stock,
    SUM(CASE WHEN stock < 0 THEN 1 ELSE 0 END) as stock_negativo
FROM productos 
WHERE activo = true;

-- 3. Listar algunos productos de ejemplo (primeros 10)
SELECT 
    'EJEMPLOS PRODUCTOS' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo
FROM productos 
WHERE activo = true
ORDER BY nombre
LIMIT 10;

-- 4. Verificar específicamente la batería Moura
SELECT 
    'BATERIA MOURA' as tipo,
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
WHERE LOWER(nombre) LIKE '%moura%'
ORDER BY nombre;

-- 5. Verificar estructura de tablas
SELECT 
    'ESTRUCTURA VENTAS' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;

-- 6. Verificar que las columnas necesarias existen
SELECT 
    'COLUMNAS NECESARIAS' as tipo,
    'ventas.metodo_pago' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'metodo_pago'
    ) as existe
UNION ALL
SELECT 
    'COLUMNAS NECESARIAS' as tipo,
    'ventas.tipo_precio' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'tipo_precio'
    ) as existe
UNION ALL
SELECT 
    'COLUMNAS NECESARIAS' as tipo,
    'ventas.estado' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'estado'
    ) as existe;
