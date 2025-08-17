-- Script para restaurar la batería Moura si está inactiva
-- Ejecutar después de investigar qué pasó

-- 1. Buscar específicamente la batería Moura
SELECT 
    'BUSQUEDA ESPECIFICA MOURA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo,
    created_at,
    updated_at
FROM productos 
WHERE 
    LOWER(nombre) LIKE '%moura%' OR 
    LOWER(codigo_sku) LIKE '%moura%'
ORDER BY created_at DESC;

-- 2. Si encontramos la batería Moura inactiva, la restauramos
-- (Descomenta las siguientes líneas si encuentras la batería con activo = false)

-- UPDATE productos 
-- SET activo = true, stock = 0
-- WHERE LOWER(nombre) LIKE '%moura%' OR LOWER(codigo_sku) LIKE '%moura%';

-- 3. Verificar el resultado
SELECT 
    'VERIFICACION POST RESTAURACION' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE 
    LOWER(nombre) LIKE '%moura%' OR 
    LOWER(codigo_sku) LIKE '%moura%'
ORDER BY created_at DESC;

-- 4. Si no encontramos la batería Moura, crear una nueva
-- (Descomenta las siguientes líneas si no existe la batería)

-- INSERT INTO productos (
--     nombre,
--     codigo_sku,
--     categoria,
--     stock,
--     precio_minorista,
--     precio_mayorista,
--     descripcion,
--     unidad_medida,
--     activo
-- ) VALUES (
--     'Batería Moura',
--     'BAT-MOURA-001',
--     'Baterías',
--     0,
--     50000,
--     45000,
--     'Batería de automóvil marca Moura',
--     'unidad',
--     true
-- );

-- 5. Verificar productos similares que podrían ser la batería Moura
SELECT 
    'PRODUCTOS SIMILARES A MOURA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo,
    created_at
FROM productos 
WHERE 
    LOWER(nombre) LIKE '%bater%' OR
    LOWER(nombre) LIKE '%moura%' OR
    LOWER(codigo_sku) LIKE '%bater%' OR
    LOWER(codigo_sku) LIKE '%moura%'
ORDER BY nombre;
