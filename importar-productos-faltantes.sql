-- Script para importar productos faltantes del archivo producto.txt
-- Crear la batería Moura si no existe

-- 1. Verificar si la batería Moura existe
SELECT 
    'VERIFICACION ANTES DE IMPORTAR' as tipo,
    'BATERIA YTX5LBS MOURA TITAN 150 BIZ' as producto,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM productos 
            WHERE LOWER(nombre) LIKE '%bateria%ytx5lbs%moura%titan%150%biz%'
        ) THEN 'YA EXISTE'
        ELSE 'NO EXISTE - CREAR'
    END as estado;

-- 2. Crear la batería Moura si no existe
INSERT INTO productos (
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    descripcion,
    unidad_medida,
    activo
) 
SELECT 
    'BATERIA YTX5LBS MOURA TITAN 150 BIZ',
    '1476',
    'Eléctrico',
    4,
    50000,
    45000,
    'Batería de moto YTX5LBS Moura Titan 150 BIZ',
    'unidad',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM productos 
    WHERE LOWER(nombre) LIKE '%bateria%ytx5lbs%moura%titan%150%biz%'
);

-- 3. Verificar que se creó correctamente
SELECT 
    'VERIFICACION POST IMPORTACION' as tipo,
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
WHERE LOWER(nombre) LIKE '%bateria%ytx5lbs%moura%titan%150%biz%'
ORDER BY created_at DESC;

-- 4. Verificar productos activos totales
SELECT 
    'ESTADISTICAS FINALES' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos
FROM productos;

-- 5. Verificar productos con "moura" en el nombre
SELECT 
    'PRODUCTOS MOURA FINALES' as tipo,
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
