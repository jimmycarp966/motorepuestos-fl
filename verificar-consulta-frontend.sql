-- Script para verificar la consulta exacta que hace el frontend
-- Simular la consulta de productosSlice.ts

-- 1. Consulta exacta del frontend (productosSlice.ts línea 22-25)
SELECT 
    'CONSULTA FRONTEND' as tipo,
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
WHERE activo = true
ORDER BY created_at DESC;

-- 2. Buscar específicamente la batería Moura en la consulta del frontend
SELECT 
    'BUSQUEDA MOURA EN FRONTEND' as tipo,
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
WHERE activo = true 
    AND (LOWER(nombre) LIKE '%moura%' OR LOWER(codigo_sku) LIKE '%moura%')
ORDER BY created_at DESC;

-- 3. Verificar si hay algún problema con el producto específico
SELECT 
    'VERIFICACION PRODUCTO MOURA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo,
    descripcion,
    unidad_medida,
    created_at,
    updated_at
FROM productos 
WHERE id = 'fb66f2a7-c7e1-438c-9ead-6e0f528b6538';

-- 4. Contar productos activos vs inactivos
SELECT 
    'ESTADISTICAS PRODUCTOS' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos,
    SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as con_stock,
    SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as sin_stock,
    SUM(CASE WHEN stock < 0 THEN 1 ELSE 0 END) as stock_negativo
FROM productos;

-- 5. Verificar productos con nombres que contengan "moura" (case insensitive)
SELECT 
    'BUSQUEDA CASE INSENSITIVE' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE LOWER(nombre) LIKE '%moura%'
ORDER BY nombre;
