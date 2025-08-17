-- Script para verificar datos actuales antes de limpiar
-- Ejecutar este script primero para ver qué datos existen

-- 1. Verificar ventas existentes
SELECT 
    'VENTAS EXISTENTES' as tipo,
    COUNT(*) as cantidad,
    SUM(total) as total_ventas,
    MIN(fecha) as primera_venta,
    MAX(fecha) as ultima_venta
FROM ventas;

-- 2. Verificar items de ventas
SELECT 
    'ITEMS DE VENTAS' as tipo,
    COUNT(*) as cantidad_items,
    SUM(cantidad) as total_cantidad,
    SUM(subtotal) as total_subtotal
FROM venta_items;

-- 3. Verificar movimientos de caja
SELECT 
    'MOVIMIENTOS CAJA' as tipo,
    COUNT(*) as cantidad_movimientos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos,
    MIN(fecha) as primer_movimiento,
    MAX(fecha) as ultimo_movimiento
FROM movimientos_caja;

-- 4. Detalle de ventas recientes (últimas 5)
SELECT 
    'DETALLE VENTAS RECIENTES' as tipo,
    id,
    fecha,
    total,
    metodo_pago,
    tipo_precio,
    created_at
FROM ventas 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Detalle de movimientos de caja recientes (últimos 5)
SELECT 
    'DETALLE MOVIMIENTOS RECIENTES' as tipo,
    id,
    fecha,
    tipo,
    concepto,
    monto,
    metodo_pago
FROM movimientos_caja 
ORDER BY fecha DESC 
LIMIT 5;

-- ✅ Después de revisar estos datos, puedes decidir si ejecutar el script de limpieza
