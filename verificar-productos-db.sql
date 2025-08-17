-- Script para verificar el estado actual de los productos en la base de datos

-- 1. Verificar total de productos
SELECT 
    'TOTAL PRODUCTOS' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos
FROM productos;

-- 2. Verificar productos por categoría
SELECT 
    'PRODUCTOS POR CATEGORIA' as tipo,
    categoria,
    COUNT(*) as cantidad
FROM productos 
WHERE activo = true
GROUP BY categoria
ORDER BY cantidad DESC;

-- 3. Verificar productos con "moura" en el nombre
SELECT 
    'PRODUCTOS MOURA' as tipo,
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

-- 4. Verificar productos con "bateria" en el nombre
SELECT 
    'PRODUCTOS BATERIA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo
FROM productos 
WHERE LOWER(nombre) LIKE '%bateria%'
ORDER BY nombre;

-- 5. Verificar productos más recientes
SELECT 
    'PRODUCTOS RECIENTES' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE activo = true
ORDER BY created_at DESC
LIMIT 10;

-- 6. Verificar productos con SKU específico de baterías
SELECT 
    'BATERIAS POR SKU' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo
FROM productos 
WHERE codigo_sku IN ('1476', '1481', '1482', '1002325', '1363', '1869', '1634', '1560', '1483')
ORDER BY codigo_sku;
