-- ================================================
-- INVESTIGACIÓN: MOVIMIENTO DE CAJA NO CREADO
-- ================================================
-- Script para investigar por qué no se crea el movimiento de caja automáticamente

-- Verificar si existe el trigger para crear movimientos de caja
SELECT 
    'TRIGGERS EN VENTAS' as verificacion,
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name LIKE '%movimiento%' OR trigger_name LIKE '%caja%' THEN '✅ RELEVANTE'
        ELSE 'ℹ️ OTRO'
    END as relevancia
FROM information_schema.triggers 
WHERE event_object_table = 'ventas'
ORDER BY trigger_name;

-- Verificar funciones relacionadas con movimientos de caja
SELECT 
    'FUNCIONES RELACIONADAS' as verificacion,
    proname as nombre_funcion,
    prosrc as codigo_fuente
FROM pg_proc 
WHERE proname LIKE '%movimiento%' 
   OR proname LIKE '%caja%'
   OR prosrc LIKE '%movimientos_caja%'
ORDER BY proname;

-- Verificar la última venta creada
SELECT 
    'ÚLTIMA VENTA CREADA' as verificacion,
    id,
    total,
    metodo_pago,
    estado,
    fecha,
    created_at,
    updated_at
FROM ventas 
ORDER BY created_at DESC 
LIMIT 1;

-- Verificar si hay algún movimiento de caja reciente
SELECT 
    'MOVIMIENTOS DE CAJA RECIENTES' as verificacion,
    id,
    tipo,
    monto,
    concepto,
    fecha,
    created_at,
    CASE 
        WHEN concepto LIKE '%venta%' THEN '✅ RELACIONADO CON VENTA'
        ELSE 'ℹ️ OTRO TIPO'
    END as tipo_movimiento
FROM movimientos_caja 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar si existe alguna función que debería crear movimientos automáticamente
SELECT 
    'FUNCIONES DE TRIGGER' as verificacion,
    proname as nombre_funcion,
    CASE 
        WHEN prosrc LIKE '%INSERT INTO movimientos_caja%' THEN '✅ CREA MOVIMIENTOS'
        WHEN prosrc LIKE '%movimientos_caja%' THEN '⚠️ MENCIONA MOVIMIENTOS'
        ELSE 'ℹ️ NO RELACIONADA'
    END as funcionalidad
FROM pg_proc 
WHERE prosrc LIKE '%movimientos_caja%'
   OR prosrc LIKE '%INSERT INTO%'
ORDER BY proname;

-- Verificar si hay algún trigger que debería ejecutarse después de INSERT en ventas
SELECT 
    'TRIGGERS POST-INSERT' as verificacion,
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN event_manipulation = 'INSERT' THEN '✅ POST-INSERT'
        ELSE 'ℹ️ OTRO EVENTO'
    END as tipo_evento
FROM information_schema.triggers 
WHERE event_object_table = 'ventas'
  AND event_manipulation = 'INSERT'
ORDER BY trigger_name;

-- Verificar si existe alguna función específica para crear movimientos de caja
SELECT 
    'FUNCIONES ESPECÍFICAS' as verificacion,
    proname as nombre_funcion,
    CASE 
        WHEN prosrc LIKE '%crear_movimiento%' THEN '✅ FUNCIÓN ESPECÍFICA'
        WHEN prosrc LIKE '%registrar_movimiento%' THEN '✅ FUNCIÓN ESPECÍFICA'
        WHEN prosrc LIKE '%insertar_movimiento%' THEN '✅ FUNCIÓN ESPECÍFICA'
        ELSE 'ℹ️ OTRA FUNCIÓN'
    END as tipo_funcion
FROM pg_proc 
WHERE prosrc LIKE '%crear_movimiento%'
   OR prosrc LIKE '%registrar_movimiento%'
   OR prosrc LIKE '%insertar_movimiento%'
ORDER BY proname;

-- Verificar si hay algún problema con la estructura de la tabla movimientos_caja
SELECT 
    'ESTRUCTURA MOVIMIENTOS_CAJA' as verificacion,
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('tipo', 'monto', 'concepto', 'empleado_id') THEN '✅ REQUERIDA'
        ELSE 'ℹ️ OPCIONAL'
    END as importancia
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja'
ORDER BY column_name;

-- Intentar crear un movimiento de caja manualmente para ver si hay errores
DO $$
DECLARE
    ultima_venta_id UUID;
    ultima_venta_total DECIMAL;
    ultima_venta_empleado_id UUID;
BEGIN
    -- Obtener datos de la última venta
    SELECT id, total, empleado_id INTO ultima_venta_id, ultima_venta_total, ultima_venta_empleado_id
    FROM ventas 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RAISE NOTICE 'Intentando crear movimiento para venta: %, monto: %, empleado: %', 
                 ultima_venta_id, ultima_venta_total, ultima_venta_empleado_id;
    
    -- Intentar insertar movimiento manualmente
    INSERT INTO movimientos_caja (
        tipo,
        monto,
        concepto,
        empleado_id,
        fecha
    ) VALUES (
        'ingreso',
        ultima_venta_total,
        'Venta #' || ultima_venta_id,
        ultima_venta_empleado_id,
        NOW()
    );
    
    RAISE NOTICE '✅ Movimiento creado manualmente exitosamente';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error al crear movimiento manualmente: %', SQLERRM;
END $$;

-- Verificar si el movimiento manual se creó
SELECT 
    'MOVIMIENTO MANUAL CREADO' as verificacion,
    id,
    tipo,
    monto,
    concepto,
    empleado_id,
    fecha,
    created_at
FROM movimientos_caja 
ORDER BY created_at DESC 
LIMIT 1;


