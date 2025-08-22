-- ================================================
-- PRUEBA DE CREACIÓN DE VENTAS
-- ================================================
-- Script para probar la creación de ventas y verificar fechas/horas

-- Verificar estado actual antes de la prueba
SELECT 
    'ESTADO ANTES DE LA PRUEBA' as verificacion,
    COUNT(*) as total_ventas,
    COUNT(CASE WHEN estado = 'activa' THEN 1 END) as activas,
    COUNT(CASE WHEN estado = 'eliminada' THEN 1 END) as eliminadas,
    MIN(created_at) as venta_mas_antigua,
    MAX(created_at) as venta_mas_reciente
FROM ventas;

-- Mostrar algunas ventas existentes como referencia
SELECT 
    'VENTAS EXISTENTES (últimas 5)' as verificacion,
    id,
    total,
    metodo_pago,
    estado,
    fecha,
    created_at,
    updated_at,
    EXTRACT(HOUR FROM created_at) as hora_creacion,
    EXTRACT(MINUTE FROM created_at) as minuto_creacion
FROM ventas 
ORDER BY created_at DESC 
LIMIT 5;

-- ================================
-- CREAR VENTA DE PRUEBA
-- ================================

-- Insertar una venta de prueba
INSERT INTO ventas (
    cliente_id,
    empleado_id,
    total,
    metodo_pago,
    tipo_precio,
    estado,
    fecha
) VALUES (
    (SELECT id FROM clientes LIMIT 1), -- Usar el primer cliente disponible
    (SELECT id FROM empleados LIMIT 1), -- Usar el primer empleado disponible
    1500.00,
    'efectivo',
    'precio_venta',
    'activa',
    NOW()
) RETURNING id, total, fecha, created_at, updated_at;

-- ================================
-- VERIFICAR LA VENTA CREADA
-- ================================

-- Obtener la venta que acabamos de crear
WITH venta_creada AS (
    SELECT 
        id,
        total,
        metodo_pago,
        estado,
        fecha,
        created_at,
        updated_at
    FROM ventas 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'VENTA CREADA EN LA PRUEBA' as verificacion,
    id,
    total,
    metodo_pago,
    estado,
    fecha,
    created_at,
    updated_at,
    EXTRACT(HOUR FROM created_at) as hora_creacion,
    EXTRACT(MINUTE FROM created_at) as minuto_creacion,
    EXTRACT(SECOND FROM created_at) as segundo_creacion,
    created_at::time as hora_completa_creacion,
    created_at::date as fecha_creacion
FROM venta_creada;

-- ================================
-- VERIFICAR MOVIMIENTO DE CAJA
-- ================================

-- Verificar si se creó el movimiento de caja correspondiente
SELECT 
    'MOVIMIENTO DE CAJA GENERADO' as verificacion,
    id,
    tipo,
    monto,
    concepto,
    estado,
    fecha,
    created_at,
    updated_at,
    EXTRACT(HOUR FROM created_at) as hora_creacion,
    EXTRACT(MINUTE FROM created_at) as minuto_creacion,
    created_at::time as hora_completa_creacion,
    created_at::date as fecha_creacion
FROM movimientos_caja 
WHERE concepto LIKE '%venta%' 
ORDER BY created_at DESC 
LIMIT 1;

-- ================================
-- COMPARAR FECHAS
-- ================================

-- Comparar fechas entre venta y movimiento de caja
WITH ultima_venta AS (
    SELECT 
        id as venta_id,
        total,
        created_at as venta_created_at,
        fecha as venta_fecha
    FROM ventas 
    ORDER BY created_at DESC 
    LIMIT 1
),
ultimo_movimiento AS (
    SELECT 
        id as movimiento_id,
        monto,
        created_at as movimiento_created_at,
        fecha as movimiento_fecha
    FROM movimientos_caja 
    WHERE concepto LIKE '%venta%' 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'COMPARACIÓN DE FECHAS' as verificacion,
    v.venta_id,
    v.total as monto_venta,
    m.monto as monto_movimiento,
    v.venta_created_at,
    m.movimiento_created_at,
    v.venta_fecha,
    m.movimiento_fecha,
    CASE 
        WHEN v.venta_created_at = m.movimiento_created_at THEN '✅ IGUALES'
        ELSE '❌ DIFERENTES'
    END as comparacion_created_at,
    CASE 
        WHEN v.venta_fecha = m.movimiento_fecha THEN '✅ IGUALES'
        ELSE '❌ DIFERENTES'
    END as comparacion_fecha
FROM ultima_venta v
CROSS JOIN ultimo_movimiento m;

-- ================================
-- VERIFICAR TIMEZONE
-- ================================

-- Verificar configuración de timezone
SELECT 
    'CONFIGURACIÓN TIMEZONE' as verificacion,
    current_setting('timezone') as timezone_actual,
    NOW() as hora_actual_servidor,
    NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina,
    EXTRACT(HOUR FROM NOW()) as hora_actual_hora,
    EXTRACT(MINUTE FROM NOW()) as hora_actual_minuto;

-- ================================
-- RESUMEN FINAL
-- ================================

SELECT 
    'RESUMEN DE LA PRUEBA' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM ventas 
            WHERE created_at >= NOW() - INTERVAL '5 minutes'
        ) THEN '✅ VENTA CREADA EXITOSAMENTE'
        ELSE '❌ ERROR AL CREAR VENTA'
    END as resultado_venta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM movimientos_caja 
            WHERE created_at >= NOW() - INTERVAL '5 minutes'
            AND concepto LIKE '%venta%'
        ) THEN '✅ MOVIMIENTO DE CAJA CREADO'
        ELSE '❌ ERROR AL CREAR MOVIMIENTO'
    END as resultado_movimiento;
