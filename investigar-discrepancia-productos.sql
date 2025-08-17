-- Script para investigar la discrepancia de productos
-- Verificar por qué hay 1000 en BD pero 1400+ en producto.txt

-- 1. Contar productos totales vs activos
SELECT 
    'CONTEO TOTAL' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos
FROM productos;

-- 2. Verificar productos inactivos (soft delete)
SELECT 
    'PRODUCTOS INACTIVOS' as tipo,
    COUNT(*) as cantidad,
    MIN(created_at) as producto_mas_antiguo,
    MAX(created_at) as producto_mas_reciente
FROM productos 
WHERE activo = false;

-- 3. Verificar productos activos por categoría
SELECT 
    'PRODUCTOS ACTIVOS POR CATEGORIA' as tipo,
    categoria,
    COUNT(*) as cantidad,
    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as con_stock,
    SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as sin_stock
FROM productos 
WHERE activo = true
GROUP BY categoria
ORDER BY cantidad DESC;

-- 4. Verificar productos inactivos por categoría
SELECT 
    'PRODUCTOS INACTIVOS POR CATEGORIA' as tipo,
    categoria,
    COUNT(*) as cantidad
FROM productos 
WHERE activo = false
GROUP BY categoria
ORDER BY cantidad DESC;

-- 5. Verificar si hay productos duplicados
SELECT 
    'VERIFICACION DUPLICADOS' as tipo,
    nombre,
    codigo_sku,
    COUNT(*) as cantidad,
    STRING_AGG(activo::text, ', ') as estados
FROM productos 
GROUP BY nombre, codigo_sku
HAVING COUNT(*) > 1
ORDER BY cantidad DESC
LIMIT 20;

-- 6. Verificar productos con nombres similares a Moura
SELECT 
    'PRODUCTOS SIMILARES MOURA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE LOWER(nombre) LIKE '%moura%' OR LOWER(codigo_sku) LIKE '%moura%'
ORDER BY activo DESC, nombre;

-- 7. Verificar productos recientemente creados
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
ORDER BY created_at DESC
LIMIT 10;

-- 8. Verificar productos con stock 0 o negativo
SELECT 
    'PRODUCTOS SIN STOCK' as tipo,
    COUNT(*) as cantidad,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as activos_sin_stock,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as inactivos_sin_stock
FROM productos 
WHERE stock <= 0;
