-- Script para verificar productos y su stock
-- Ejecutar para ver qué productos están disponibles

-- 1. Verificar todos los productos con su stock
SELECT 
    'TODOS LOS PRODUCTOS' as tipo,
    COUNT(*) as cantidad_total,
    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as con_stock,
    SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as sin_stock,
    SUM(CASE WHEN stock < 0 THEN 1 ELSE 0 END) as stock_negativo
FROM productos;

-- 2. Listar productos con stock
SELECT 
    'PRODUCTOS CON STOCK' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista
FROM productos 
WHERE stock > 0
ORDER BY nombre;

-- 3. Listar productos sin stock
SELECT 
    'PRODUCTOS SIN STOCK' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista
FROM productos 
WHERE stock <= 0
ORDER BY nombre;

-- 4. Listar productos con stock negativo
SELECT 
    'PRODUCTOS CON STOCK NEGATIVO' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista
FROM productos 
WHERE stock < 0
ORDER BY nombre;

-- 5. Verificar si hay productos activos/inactivos
SELECT 
    'ESTADO DE PRODUCTOS' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as inactivos,
    SUM(CASE WHEN activo IS NULL THEN 1 ELSE 0 END) as sin_estado
FROM productos;
