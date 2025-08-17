-- Script para limpiar todo EXCEPTO productos
-- Esto mantendrá todos los productos intactos

-- 1. Verificar datos actuales antes de limpiar
SELECT 
    'DATOS ANTES DE LIMPIAR' as tipo,
    'ventas' as tabla,
    COUNT(*) as registros
FROM ventas
UNION ALL
SELECT 
    'DATOS ANTES DE LIMPIAR' as tipo,
    'venta_items' as tabla,
    COUNT(*) as registros
FROM venta_items
UNION ALL
SELECT 
    'DATOS ANTES DE LIMPIAR' as tipo,
    'movimientos_caja' as tabla,
    COUNT(*) as registros
FROM movimientos_caja
UNION ALL
SELECT 
    'DATOS ANTES DE LIMPIAR' as tipo,
    'productos' as tabla,
    COUNT(*) as registros
FROM productos;

-- 2. Limpiar ventas y caja (NO productos)
DELETE FROM venta_items;
DELETE FROM ventas;
DELETE FROM movimientos_caja;

-- 3. Verificar que se limpiaron correctamente
SELECT 
    'VERIFICACION POST LIMPIEZA' as tipo,
    'ventas' as tabla,
    COUNT(*) as registros
FROM ventas
UNION ALL
SELECT 
    'VERIFICACION POST LIMPIEZA' as tipo,
    'venta_items' as tabla,
    COUNT(*) as registros
FROM venta_items
UNION ALL
SELECT 
    'VERIFICACION POST LIMPIEZA' as tipo,
    'movimientos_caja' as tabla,
    COUNT(*) as registros
FROM movimientos_caja
UNION ALL
SELECT 
    'VERIFICACION POST LIMPIEZA' as tipo,
    'productos' as tabla,
    COUNT(*) as registros
FROM productos;

-- 4. Verificar que la batería Moura sigue intacta
SELECT 
    'VERIFICACION BATERIA MOURA' as tipo,
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
