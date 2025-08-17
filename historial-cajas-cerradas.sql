-- HISTORIAL DE CAJAS CERRADAS POR FECHA
-- Este script te muestra todas las cajas cerradas con sus resúmenes

-- =====================================================
-- 1. RESUMEN DE TODAS LAS CAJAS CERRADAS
-- =====================================================

SELECT 
    '📊 HISTORIAL DE CAJAS CERRADAS' as titulo,
    'Todas las fechas con actividad' as descripcion

UNION ALL

-- Resumen de todas las fechas con actividad
SELECT 
    '📅 FECHA: ' || DATE(mc.fecha) as fecha,
    '💰 INGRESOS: $' || COALESCE(SUM(CASE WHEN mc.tipo = 'ingreso' THEN mc.monto ELSE 0 END), 0) ||
    ' | ➖ EGRESOS: $' || COALESCE(SUM(CASE WHEN mc.tipo = 'egreso' THEN mc.monto ELSE 0 END), 0) ||
    ' | 📈 SALDO: $' || COALESCE(SUM(CASE WHEN mc.tipo = 'ingreso' THEN mc.monto ELSE -mc.monto END), 0) ||
    ' | 🔢 VENTAS: ' || COALESCE((
        SELECT COUNT(*) FROM ventas v WHERE DATE(v.fecha) = DATE(mc.fecha)
    ), 0) ||
    ' | ✅ ARQUEO: ' || CASE WHEN ac.completado THEN 'SÍ' ELSE 'NO' END
FROM movimientos_caja mc
LEFT JOIN arqueos_caja ac ON ac.fecha = DATE(mc.fecha)
GROUP BY DATE(mc.fecha), ac.completado
ORDER BY DATE(mc.fecha) DESC;

-- =====================================================
-- 2. DETALLE DE UNA FECHA ESPECÍFICA (CAMBIA LA FECHA)
-- =====================================================

-- Para ver el detalle de una fecha específica, cambia esta fecha:
WITH fecha_especifica AS (SELECT '2024-01-15'::DATE as fecha)

SELECT 
    '🔍 DETALLE CAJA DEL DÍA' as titulo,
    fs.fecha as fecha_consultada
FROM fecha_especifica fs

UNION ALL

-- Movimientos del día
SELECT 
    '📋 MOVIMIENTOS:' as tipo,
    'Hora: ' || TO_CHAR(mc.fecha, 'HH24:MI') || ' | ' || 
    CASE WHEN mc.tipo = 'ingreso' THEN '➕' ELSE '➖' END || ' $' || mc.monto || 
    ' | ' || mc.concepto || ' | ' || COALESCE(e.nombre, 'Sin empleado')
FROM movimientos_caja mc
LEFT JOIN empleados e ON mc.empleado_id = e.id, fecha_especifica fs
WHERE DATE(mc.fecha) = fs.fecha
ORDER BY mc.fecha

UNION ALL

-- Ventas del día
SELECT 
    '🛒 VENTAS:' as tipo,
    'Venta #' || v.id || ' | $' || v.total || ' | ' || v.metodo_pago || 
    ' | Cliente: ' || COALESCE(c.nombre, 'Sin cliente') || 
    ' | Empleado: ' || COALESCE(e.nombre, 'Sin empleado')
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN empleados e ON v.empleado_id = e.id, fecha_especifica fs
WHERE DATE(v.fecha) = fs.fecha
ORDER BY v.fecha

UNION ALL

-- Arqueo del día
SELECT 
    '✅ ARQUEO:' as tipo,
    CASE 
        WHEN ac.completado THEN 
            'COMPLETADO | Efectivo: $' || ac.efectivo_real || 
            ' | Tarjeta: $' || ac.tarjeta_real || 
            ' | Transferencia: $' || ac.transferencia_real ||
            ' | Diferencia: $' || ac.total_diferencia
        ELSE 'NO COMPLETADO'
    END
FROM arqueos_caja ac, fecha_especifica fs
WHERE ac.fecha = fs.fecha;

-- =====================================================
-- 3. RESUMEN MENSUAL (ÚLTIMOS 12 MESES)
-- =====================================================

SELECT 
    '📊 RESUMEN MENSUAL' as titulo,
    'Últimos 12 meses de actividad' as descripcion

UNION ALL

SELECT 
    '📅 MES: ' || TO_CHAR(DATE_TRUNC('month', mc.fecha), 'YYYY-MM') as mes,
    '💰 INGRESOS: $' || COALESCE(SUM(CASE WHEN mc.tipo = 'ingreso' THEN mc.monto ELSE 0 END), 0) ||
    ' | ➖ EGRESOS: $' || COALESCE(SUM(CASE WHEN mc.tipo = 'egreso' THEN mc.monto ELSE 0 END), 0) ||
    ' | 📈 SALDO: $' || COALESCE(SUM(CASE WHEN mc.tipo = 'ingreso' THEN mc.monto ELSE -mc.monto END), 0) ||
    ' | 🔢 VENTAS: ' || COALESCE((
        SELECT COUNT(*) FROM ventas v 
        WHERE DATE_TRUNC('month', v.fecha) = DATE_TRUNC('month', mc.fecha)
    ), 0) ||
    ' | 📅 DÍAS ACTIVOS: ' || COUNT(DISTINCT DATE(mc.fecha))
FROM movimientos_caja mc
WHERE mc.fecha >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', mc.fecha)
ORDER BY DATE_TRUNC('month', mc.fecha) DESC;

-- =====================================================
-- 4. TOP 10 DÍAS CON MÁS VENTAS
-- =====================================================

SELECT 
    '🏆 TOP 10 DÍAS CON MÁS VENTAS' as titulo,
    'Rendimiento por día' as descripcion

UNION ALL

SELECT 
    '📅 FECHA: ' || DATE(v.fecha) as fecha,
    '💰 TOTAL VENTAS: $' || COALESCE(SUM(v.total), 0) ||
    ' | 🔢 CANTIDAD VENTAS: ' || COUNT(*) ||
    ' | 👤 EMPLEADOS: ' || COUNT(DISTINCT v.empleado_id)
FROM ventas v
GROUP BY DATE(v.fecha)
ORDER BY SUM(v.total) DESC
LIMIT 10;

-- =====================================================
-- 5. EMPLEADOS CON MÁS VENTAS
-- =====================================================

SELECT 
    '👥 EMPLEADOS CON MÁS VENTAS' as titulo,
    'Rendimiento por empleado' as descripcion

UNION ALL

SELECT 
    '👤 EMPLEADO: ' || e.nombre as empleado,
    '💰 TOTAL VENTAS: $' || COALESCE(SUM(v.total), 0) ||
    ' | 🔢 CANTIDAD VENTAS: ' || COUNT(*) ||
    ' | 📅 DÍAS TRABAJADOS: ' || COUNT(DISTINCT DATE(v.fecha))
FROM empleados e
LEFT JOIN ventas v ON e.id = v.empleado_id
WHERE v.id IS NOT NULL
GROUP BY e.id, e.nombre
ORDER BY SUM(v.total) DESC;
