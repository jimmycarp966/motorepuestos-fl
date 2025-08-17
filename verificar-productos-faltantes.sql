-- Script para verificar qué productos del archivo faltan en la BD
-- Comparar producto.txt con la base de datos

-- 1. Verificar productos que están en la BD pero no en el archivo
-- (Esto nos dará una idea de la estructura)

-- 2. Verificar productos específicos del archivo en la BD
SELECT 
    'VERIFICACION PRODUCTOS ARCHIVO' as tipo,
    'BATERIA YTX5LBS MOURA TITAN 150 BIZ' as producto_buscado,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM productos 
            WHERE LOWER(nombre) LIKE '%bateria%ytx5lbs%moura%titan%150%biz%'
        ) THEN 'ENCONTRADO'
        ELSE 'NO ENCONTRADO'
    END as estado;

-- 3. Verificar productos con nombres similares
SELECT 
    'PRODUCTOS SIMILARES' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE 
    LOWER(nombre) LIKE '%bateria%' AND
    LOWER(nombre) LIKE '%moura%'
ORDER BY nombre;

-- 4. Verificar productos con SKU específico del archivo
SELECT 
    'BUSQUEDA POR SKU' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE codigo_sku = '1476'  -- SKU de la batería Moura del archivo
ORDER BY nombre;

-- 5. Verificar productos inactivos que podrían ser la batería Moura
SELECT 
    'PRODUCTOS INACTIVOS SIMILARES' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE 
    activo = false AND
    (LOWER(nombre) LIKE '%bateria%' OR LOWER(nombre) LIKE '%moura%')
ORDER BY nombre;

-- 6. Verificar si hay productos con nombres exactos del archivo
SELECT 
    'BUSQUEDA EXACTA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE nombre ILIKE '%BATERIA YTX5LBS MOURA TITAN 150 BIZ%'
ORDER BY nombre;

-- 7. Verificar productos con "TITAN" en el nombre
SELECT 
    'PRODUCTOS CON TITAN' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE LOWER(nombre) LIKE '%titan%'
ORDER BY nombre;
