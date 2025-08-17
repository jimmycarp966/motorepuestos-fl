-- CONSULTA RÁPIDA DE CAJA POR FECHA
-- Cambia la fecha en la línea 4

-- =====================================================
-- CONSULTA RÁPIDA - CAMBIA LA FECHA AQUÍ
-- =====================================================

-- FECHA A CONSULTAR (cambia esta línea)
WITH fecha_consulta AS (SELECT '2024-01-15'::DATE as fecha)

-- RESUMEN COMPLETO DEL DÍA
SELECT 
    '📊 RESUMEN CAJA DEL DÍA' as titulo,
    fc.fecha as fecha_consultada
FROM fecha_consulta fc

UNION ALL

SELECT 
    '💰 INGRESOS POR VENTAS: $' || COALESCE((
        SELECT SUM(total) 
        FROM ventas v, fecha_consulta fc
        WHERE DATE(v.fecha) = fc.fecha
    ), 0),
    '💳 VENTAS EFECTIVO: $' || COALESCE((
        SELECT SUM(total) 
        FROM ventas v, fecha_consulta fc
        WHERE DATE(v.fecha) = fc.fecha AND v.metodo_pago = 'efectivo'
    ), 0)

UNION ALL

SELECT 
    '💳 VENTAS TARJETA: $' || COALESCE((
        SELECT SUM(total) 
        FROM ventas v, fecha_consulta fc
        WHERE DATE(v.fecha) = fc.fecha AND v.metodo_pago = 'tarjeta'
    ), 0),
    '🏦 VENTAS TRANSFERENCIA: $' || COALESCE((
        SELECT SUM(total) 
        FROM ventas v, fecha_consulta fc
        WHERE DATE(v.fecha) = fc.fecha AND v.metodo_pago = 'transferencia'
    ), 0)

UNION ALL

SELECT 
    '➕ INGRESOS ADICIONALES: $' || COALESCE((
        SELECT SUM(monto) 
        FROM movimientos_caja mc, fecha_consulta fc
        WHERE DATE(mc.fecha) = fc.fecha AND mc.tipo = 'ingreso' 
        AND mc.concepto NOT LIKE '%Venta #%'
    ), 0),
    '➖ EGRESOS: $' || COALESCE((
        SELECT SUM(monto) 
        FROM movimientos_caja mc, fecha_consulta fc
        WHERE DATE(mc.fecha) = fc.fecha AND mc.tipo = 'egreso'
    ), 0)

UNION ALL

SELECT 
    '📈 SALDO DEL DÍA: $' || COALESCE((
        SELECT SUM(CASE WHEN mc.tipo = 'ingreso' THEN mc.monto ELSE -mc.monto END)
        FROM movimientos_caja mc, fecha_consulta fc
        WHERE DATE(mc.fecha) = fc.fecha
    ), 0),
    '🔢 CANTIDAD VENTAS: ' || COALESCE((
        SELECT COUNT(*) 
        FROM ventas v, fecha_consulta fc
        WHERE DATE(v.fecha) = fc.fecha
    ), 0)

UNION ALL

SELECT 
    '✅ ARQUEO COMPLETADO: ' || CASE WHEN ac.completado THEN 'SÍ' ELSE 'NO' END,
    '👤 EMPLEADO ARQUEO: ' || COALESCE(e.nombre, 'No registrado')
FROM fecha_consulta fc
LEFT JOIN arqueos_caja ac ON ac.fecha = fc.fecha
LEFT JOIN empleados e ON ac.empleado_id = e.id;
