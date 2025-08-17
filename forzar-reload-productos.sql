-- Script para forzar la actualización de productos
-- Esto puede ayudar si hay problemas de cache

-- 1. Verificar que la batería Moura esté correctamente configurada
UPDATE productos 
SET updated_at = NOW()
WHERE id = 'fb66f2a7-c7e1-438c-9ead-6e0f528b6538';

-- 2. Verificar el resultado
SELECT 
    'VERIFICACION POST UPDATE' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at,
    updated_at
FROM productos 
WHERE id = 'fb66f2a7-c7e1-438c-9ead-6e0f528b6538';

-- 3. Listar todos los productos activos ordenados por updated_at
SELECT 
    'PRODUCTOS ACTIVOS ORDENADOS' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at,
    updated_at
FROM productos 
WHERE activo = true
ORDER BY updated_at DESC, created_at DESC;

-- 4. Verificar que no haya productos duplicados
SELECT 
    'VERIFICACION DUPLICADOS' as tipo,
    nombre,
    codigo_sku,
    COUNT(*) as cantidad
FROM productos 
WHERE activo = true
GROUP BY nombre, codigo_sku
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;
