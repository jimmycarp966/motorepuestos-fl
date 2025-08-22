-- Script de verificación para comprobar que la configuración de zona horaria funciona
-- Ejecutar después de aplicar fix-timezone-configuration.sql

-- ========================================
-- 1. VERIFICAR CONFIGURACIÓN DE ZONA HORARIA
-- ========================================

SELECT 
    'VERIFICACIÓN_ZONA_HORARIA' as seccion,
    current_setting('timezone') as zona_horaria_actual,
    now() as hora_actual_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina,
    CASE 
        WHEN current_setting('timezone') = 'America/Argentina/Buenos_Aires' THEN '✅ CONFIGURADA CORRECTAMENTE'
        ELSE '❌ REQUIERE CONFIGURACIÓN'
    END as estado;

-- ========================================
-- 2. VERIFICAR FECHAS RECIENTES EN VENTAS
-- ========================================

-- Verificar ventas de los últimos 7 días
SELECT 
    'VENTAS_ULTIMOS_7_DIAS' as seccion,
    fecha::date as dia,
    COUNT(*) as total_ventas,
    MIN(fecha::time) as hora_mas_temprana,
    MAX(fecha::time) as hora_mas_tardia,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as ventas_21hs,
    COUNT(CASE WHEN fecha::time = '18:00:00' THEN 1 END) as ventas_18hs,
    CASE 
        WHEN COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) = 0 THEN '✅ SIN PROBLEMAS'
        ELSE '⚠️ AÚN HAY VENTAS A LAS 21:00'
    END as estado
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::date
ORDER BY dia DESC;

-- ========================================
-- 3. VERIFICAR FECHAS RECIENTES EN MOVIMIENTOS_CAJA
-- ========================================

-- Verificar movimientos de los últimos 7 días
SELECT 
    'MOVIMIENTOS_ULTIMOS_7_DIAS' as seccion,
    fecha::date as dia,
    COUNT(*) as total_movimientos,
    MIN(fecha::time) as hora_mas_temprana,
    MAX(fecha::time) as hora_mas_tardia,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as movimientos_21hs,
    COUNT(CASE WHEN fecha::time = '18:00:00' THEN 1 END) as movimientos_18hs,
    CASE 
        WHEN COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) = 0 THEN '✅ SIN PROBLEMAS'
        ELSE '⚠️ AÚN HAY MOVIMIENTOS A LAS 21:00'
    END as estado
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::date
ORDER BY dia DESC;

-- ========================================
-- 4. VERIFICAR VENTAS DE HOY
-- ========================================

-- Verificar ventas de hoy
SELECT 
    'VENTAS_HOY' as seccion,
    COUNT(*) as total_ventas_hoy,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as ventas_fecha_actual,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as ventas_21hs_hoy,
    COUNT(CASE WHEN fecha::time BETWEEN '08:00:00' AND '22:00:00' THEN 1 END) as ventas_horario_normal,
    CASE 
        WHEN COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) = 0 THEN '✅ HORARIOS CORRECTOS'
        ELSE '❌ AÚN HAY VENTAS A LAS 21:00'
    END as estado
FROM ventas 
WHERE fecha::date = CURRENT_DATE;

-- Mostrar ventas de hoy con detalles
SELECT 
    'DETALLE_VENTAS_HOY' as seccion,
    id,
    total,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora,
    CASE 
        WHEN fecha::time = '21:00:00' THEN '❌ PROBLEMA DE ZONA HORARIA'
        WHEN fecha::time BETWEEN '08:00:00' AND '22:00:00' THEN '✅ HORARIO NORMAL'
        ELSE '⚠️ HORARIO FUERA DE RANGO'
    END as estado
FROM ventas 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC;

-- ========================================
-- 5. VERIFICAR MOVIMIENTOS DE HOY
-- ========================================

-- Verificar movimientos de hoy
SELECT 
    'MOVIMIENTOS_HOY' as seccion,
    COUNT(*) as total_movimientos_hoy,
    COUNT(CASE WHEN fecha::date = CURRENT_DATE THEN 1 END) as movimientos_fecha_actual,
    COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as movimientos_21hs_hoy,
    COUNT(CASE WHEN fecha::time BETWEEN '08:00:00' AND '22:00:00' THEN 1 END) as movimientos_horario_normal,
    CASE 
        WHEN COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) = 0 THEN '✅ HORARIOS CORRECTOS'
        ELSE '❌ AÚN HAY MOVIMIENTOS A LAS 21:00'
    END as estado
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE;

-- Mostrar movimientos de hoy con detalles
SELECT 
    'DETALLE_MOVIMIENTOS_HOY' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora,
    CASE 
        WHEN fecha::time = '21:00:00' THEN '❌ PROBLEMA DE ZONA HORARIA'
        WHEN fecha::time BETWEEN '08:00:00' AND '22:00:00' THEN '✅ HORARIO NORMAL'
        ELSE '⚠️ HORARIO FUERA DE RANGO'
    END as estado
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC;

-- ========================================
-- 6. VERIFICAR TRIGGERS
-- ========================================

-- Verificar que los triggers están creados
SELECT 
    'VERIFICACIÓN_TRIGGERS' as seccion,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ TRIGGER ACTIVO'
        ELSE '❌ TRIGGER FALTANTE'
    END as estado
FROM information_schema.triggers 
WHERE trigger_name IN ('ensure_timezone_ventas', 'ensure_timezone_movimientos_caja')
ORDER BY trigger_name;

-- ========================================
-- 7. SIMULAR NUEVA VENTA PARA VERIFICAR
-- ========================================

-- Crear una venta de prueba para verificar que los triggers funcionan
-- (Solo ejecutar si quieres hacer una prueba)
/*
INSERT INTO ventas (
    cliente_id, 
    empleado_id, 
    total, 
    metodo_pago, 
    tipo_precio, 
    estado, 
    fecha
) VALUES (
    (SELECT id FROM clientes LIMIT 1),
    (SELECT id FROM empleados LIMIT 1),
    100.00,
    'efectivo',
    'minorista',
    'completada',
    now()
);

-- Verificar la venta de prueba
SELECT 
    'VENTA_PRUEBA' as seccion,
    id,
    total,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora,
    CASE 
        WHEN fecha::time = '21:00:00' THEN '❌ PROBLEMA PERSISTE'
        WHEN fecha::time BETWEEN '08:00:00' AND '22:00:00' THEN '✅ PROBLEMA RESUELTO'
        ELSE '⚠️ HORARIO FUERA DE RANGO'
    END as estado
FROM ventas 
WHERE id = (SELECT MAX(id) FROM ventas);

-- Eliminar venta de prueba
DELETE FROM ventas WHERE id = (SELECT MAX(id) FROM ventas);
*/

-- ========================================
-- 8. RESUMEN FINAL DE VERIFICACIÓN
-- ========================================

WITH resumen AS (
    SELECT 
        'VENTAS' as tabla,
        COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_problematicos,
        COUNT(*) as total_registros
    FROM ventas 
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        'MOVIMIENTOS_CAJA' as tabla,
        COUNT(CASE WHEN fecha::time = '21:00:00' THEN 1 END) as registros_problematicos,
        COUNT(*) as total_registros
    FROM movimientos_caja 
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    'RESUMEN_VERIFICACIÓN' as seccion,
    tabla,
    registros_problematicos,
    total_registros,
    CASE 
        WHEN registros_problematicos = 0 THEN '✅ PROBLEMA RESUELTO'
        ELSE '❌ PROBLEMA PERSISTE'
    END as estado,
    CASE 
        WHEN registros_problematicos = 0 THEN 'La configuración de zona horaria funciona correctamente'
        ELSE 'Aún hay registros con hora 21:00 - revisar configuración'
    END as recomendacion
FROM resumen
ORDER BY registros_problematicos DESC;
