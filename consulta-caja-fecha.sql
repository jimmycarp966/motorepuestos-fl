-- CONSULTA DE CAJA POR FECHA ESPECÍFICA
-- Reemplaza '2024-01-15' con la fecha que quieres consultar

-- =====================================================
-- 1. RESUMEN GENERAL DEL DÍA
-- =====================================================

-- Configurar la fecha a consultar (cambia esta fecha)
DO $$
DECLARE
    fecha_consulta DATE := '2024-01-15'; -- CAMBIA ESTA FECHA
BEGIN
    RAISE NOTICE 'CONSULTANDO CAJA DEL DÍA: %', fecha_consulta;
END $$;

-- =====================================================
-- 2. MOVIMIENTOS DE CAJA DEL DÍA
-- =====================================================

SELECT 
    'MOVIMIENTOS DE CAJA' as seccion,
    fecha_consulta as fecha
UNION ALL
SELECT 
    'TOTAL INGRESOS: $' || COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0),
    'TOTAL EGRESOS: $' || COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0)
FROM movimientos_caja 
WHERE DATE(fecha) = '2024-01-15'; -- CAMBIA ESTA FECHA

-- Detalle de movimientos
SELECT 
    'DETALLE MOVIMIENTOS' as tipo,
    tipo as movimiento,
    monto,
    concepto,
    DATE(fecha) as fecha,
    e.nombre as empleado
FROM movimientos_caja mc
LEFT JOIN empleados e ON mc.empleado_id = e.id
WHERE DATE(mc.fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
ORDER BY mc.fecha;

-- =====================================================
-- 3. VENTAS DEL DÍA
-- =====================================================

SELECT 
    'VENTAS DEL DÍA' as seccion,
    fecha_consulta as fecha
UNION ALL
SELECT 
    'TOTAL VENTAS: $' || COALESCE(SUM(total), 0),
    'CANTIDAD VENTAS: ' || COUNT(*)
FROM ventas 
WHERE DATE(fecha) = '2024-01-15'; -- CAMBIA ESTA FECHA

-- Detalle de ventas por método de pago
SELECT 
    'VENTAS POR MÉTODO DE PAGO' as tipo,
    metodo_pago,
    COUNT(*) as cantidad_ventas,
    SUM(total) as total_ventas,
    AVG(total) as promedio_venta
FROM ventas 
WHERE DATE(fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
GROUP BY metodo_pago
ORDER BY total_ventas DESC;

-- Detalle de ventas individuales
SELECT 
    'DETALLE VENTAS' as tipo,
    v.id as venta_id,
    v.total,
    v.metodo_pago,
    v.estado,
    c.nombre as cliente,
    e.nombre as empleado,
    v.fecha
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN empleados e ON v.empleado_id = e.id
WHERE DATE(v.fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
ORDER BY v.fecha;

-- =====================================================
-- 4. ARQUEO DEL DÍA
-- =====================================================

SELECT 
    'ARQUEO DEL DÍA' as seccion,
    fecha_consulta as fecha
UNION ALL
SELECT 
    'ARQUEO COMPLETADO: ' || CASE WHEN completado THEN 'SÍ' ELSE 'NO' END,
    'EMPLEADO: ' || e.nombre
FROM arqueos_caja ac
LEFT JOIN empleados e ON ac.empleado_id = e.id
WHERE ac.fecha = '2024-01-15'; -- CAMBIA ESTA FECHA

-- Detalle del arqueo
SELECT 
    'DETALLE ARQUEO' as tipo,
    'EFECTIVO' as metodo,
    efectivo_esperado as esperado,
    efectivo_real as real,
    efectivo_diferencia as diferencia
FROM arqueos_caja 
WHERE fecha = '2024-01-15' -- CAMBIA ESTA FECHA
UNION ALL
SELECT 
    'DETALLE ARQUEO',
    'TARJETA',
    tarjeta_esperado,
    tarjeta_real,
    tarjeta_diferencia
FROM arqueos_caja 
WHERE fecha = '2024-01-15' -- CAMBIA ESTA FECHA
UNION ALL
SELECT 
    'DETALLE ARQUEO',
    'TRANSFERENCIA',
    transferencia_esperado,
    transferencia_real,
    transferencia_diferencia
FROM arqueos_caja 
WHERE fecha = '2024-01-15' -- CAMBIA ESTA FECHA
UNION ALL
SELECT 
    'DETALLE ARQUEO',
    'TOTAL',
    total_esperado,
    total_real,
    total_diferencia
FROM arqueos_caja 
WHERE fecha = '2024-01-15'; -- CAMBIA ESTA FECHA

-- =====================================================
-- 5. RESUMEN FINAL DEL DÍA
-- =====================================================

SELECT 
    'RESUMEN FINAL DEL DÍA' as seccion,
    fecha_consulta as fecha
UNION ALL
SELECT 
    'INGRESOS POR VENTAS: $' || COALESCE((
        SELECT SUM(total) 
        FROM ventas 
        WHERE DATE(fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
    ), 0),
    'INGRESOS ADICIONALES: $' || COALESCE((
        SELECT SUM(monto) 
        FROM movimientos_caja 
        WHERE DATE(fecha) = '2024-01-15' AND tipo = 'ingreso' -- CAMBIA ESTA FECHA
        AND concepto NOT LIKE '%Venta #%'
    ), 0)
UNION ALL
SELECT 
    'EGRESOS: $' || COALESCE((
        SELECT SUM(monto) 
        FROM movimientos_caja 
        WHERE DATE(fecha) = '2024-01-15' AND tipo = 'egreso' -- CAMBIA ESTA FECHA
    ), 0),
    'SALDO DEL DÍA: $' || COALESCE((
        SELECT SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END)
        FROM movimientos_caja 
        WHERE DATE(fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
    ), 0);

-- =====================================================
-- 6. PRODUCTOS MÁS VENDIDOS DEL DÍA
-- =====================================================

SELECT 
    'PRODUCTOS MÁS VENDIDOS' as seccion,
    fecha_consulta as fecha
UNION ALL
SELECT 
    'PRODUCTO: ' || p.nombre,
    'CANTIDAD: ' || SUM(vi.cantidad) || ' - TOTAL: $' || SUM(vi.subtotal)
FROM venta_items vi
JOIN ventas v ON vi.venta_id = v.id
JOIN productos p ON vi.producto_id = p.id
WHERE DATE(v.fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
GROUP BY p.id, p.nombre
ORDER BY SUM(vi.cantidad) DESC
LIMIT 10;

-- =====================================================
-- 7. EMPLEADOS QUE TRABAJARON
-- =====================================================

SELECT 
    'EMPLEADOS QUE TRABAJARON' as seccion,
    fecha_consulta as fecha
UNION ALL
SELECT 
    'EMPLEADO: ' || e.nombre,
    'VENTAS: ' || COUNT(DISTINCT v.id) || ' - TOTAL: $' || COALESCE(SUM(v.total), 0)
FROM empleados e
LEFT JOIN ventas v ON e.id = v.empleado_id AND DATE(v.fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
WHERE EXISTS (
    SELECT 1 FROM ventas v2 
    WHERE v2.empleado_id = e.id AND DATE(v2.fecha) = '2024-01-15' -- CAMBIA ESTA FECHA
)
GROUP BY e.id, e.nombre
ORDER BY SUM(v.total) DESC;
