-- Script para limpiar datos de prueba
-- Este script elimina todas las ventas y movimientos de caja para empezar desde cero

-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de ventas y caja
-- Solo ejecutar si estás seguro de que quieres empezar desde cero

-- 1. Eliminar venta_items (items de ventas)
DELETE FROM venta_items;

-- 2. Eliminar ventas
DELETE FROM ventas;

-- 3. Eliminar movimientos de caja
DELETE FROM movimientos_caja;

-- 4. Verificar que se eliminaron los datos
SELECT 
    'venta_items' as tabla,
    COUNT(*) as registros_restantes
FROM venta_items
UNION ALL
SELECT 
    'ventas' as tabla,
    COUNT(*) as registros_restantes
FROM ventas
UNION ALL
SELECT 
    'movimientos_caja' as tabla,
    COUNT(*) as registros_restantes
FROM movimientos_caja;

-- 5. Reiniciar secuencias si existen (opcional)
-- ALTER SEQUENCE IF EXISTS ventas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS venta_items_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS movimientos_caja_id_seq RESTART WITH 1;

-- ✅ Resultado esperado: Todas las tablas deberían mostrar 0 registros
