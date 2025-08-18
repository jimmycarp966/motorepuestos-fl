-- Script para limpiar todos los datos históricos del sistema
-- Ejecutar con precaución - esto eliminará TODOS los datos históricos

-- Limpiar ventas y sus items
DELETE FROM venta_items;
DELETE FROM ventas;

-- Limpiar movimientos de caja
DELETE FROM movimientos_caja;

-- Limpiar arqueos de caja
DELETE FROM arqueos_caja;

-- Limpiar cajas diarias
DELETE FROM cajas_diarias;

-- Resetear saldos de cuenta corriente de clientes
UPDATE clientes SET saldo_cuenta_corriente = 0;

-- Resetear contadores de secuencia (si existen)
-- Nota: Esto es opcional, solo si se usan secuencias

-- Verificar limpieza
SELECT 
    'venta_items' as tabla, COUNT(*) as registros FROM venta_items
UNION ALL
SELECT 'ventas' as tabla, COUNT(*) as registros FROM ventas
UNION ALL
SELECT 'movimientos_caja' as tabla, COUNT(*) as registros FROM movimientos_caja
UNION ALL
SELECT 'arqueos_caja' as tabla, COUNT(*) as registros FROM arqueos_caja
UNION ALL
SELECT 'cajas_diarias' as tabla, COUNT(*) as registros FROM cajas_diarias;
