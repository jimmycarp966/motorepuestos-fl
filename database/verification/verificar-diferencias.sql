-- Script para verificar diferencias entre productos procesados y cargados

-- 1. Verificar total de productos en la tabla
SELECT 
    COUNT(*) as total_productos_en_tabla,
    COUNT(DISTINCT codigo_sku) as skus_unicos,
    COUNT(*) - COUNT(DISTINCT codigo_sku) as skus_duplicados
FROM productos;

-- 2. Verificar productos con SKUs duplicados
SELECT 
    codigo_sku,
    COUNT(*) as cantidad_duplicados,
    STRING_AGG(nombre, ' | ') as nombres
FROM productos 
GROUP BY codigo_sku 
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC
LIMIT 10;

-- 3. Verificar productos sin SKU
SELECT 
    COUNT(*) as productos_sin_sku
FROM productos 
WHERE codigo_sku IS NULL OR codigo_sku = '';

-- 4. Verificar productos recién agregados (últimas 24 horas)
SELECT 
    COUNT(*) as productos_recientes
FROM productos 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- 5. Verificar productos actualizados (últimas 24 horas)
SELECT 
    COUNT(*) as productos_actualizados
FROM productos 
WHERE updated_at >= NOW() - INTERVAL '24 hours';

-- 6. Mostrar algunos productos recién agregados
SELECT 
    codigo_sku,
    nombre,
    categoria,
    precio_minorista,
    stock,
    created_at
FROM productos 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;

-- 7. Verificar distribución por categorías
SELECT 
    categoria,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM productos), 2) as porcentaje
FROM productos 
GROUP BY categoria 
ORDER BY cantidad DESC;
