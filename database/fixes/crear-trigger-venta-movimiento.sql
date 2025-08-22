-- ================================================
-- CREAR TRIGGER PARA MOVIMIENTO DE CAJA AUTOMÁTICO
-- ================================================
-- Script para crear el trigger que genere automáticamente
-- el movimiento de caja cuando se registra una venta

-- ================================
-- VERIFICAR FUNCIÓN EXISTENTE
-- ================================

SELECT 
    'VERIFICACIÓN FUNCIÓN' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'registrar_venta_atomica') 
        THEN '✅ FUNCIÓN registrar_venta_atomica EXISTE'
        ELSE '❌ FUNCIÓN registrar_venta_atomica NO EXISTE'
    END as estado;

-- ================================
-- CREAR FUNCIÓN DE TRIGGER
-- ================================

-- Crear función que será llamada por el trigger
CREATE OR REPLACE FUNCTION crear_movimiento_caja_venta()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo crear movimiento si no es cuenta corriente
    IF NEW.metodo_pago != 'cuenta_corriente' THEN
        INSERT INTO movimientos_caja (
            tipo,
            monto,
            concepto,
            empleado_id,
            fecha,
            metodo_pago,
            estado
        ) VALUES (
            'ingreso',
            NEW.total,
            'Venta #' || NEW.id,
            NEW.empleado_id,
            COALESCE(NEW.fecha, CURRENT_DATE),
            NEW.metodo_pago,
            'activa'
        );
        
        RAISE NOTICE '✅ Movimiento de caja creado para venta #%', NEW.id;
    ELSE
        RAISE NOTICE 'ℹ️ Venta en cuenta corriente - no se crea movimiento de caja';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- CREAR TRIGGER
-- ================================

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_crear_movimiento_caja_venta ON ventas;

-- Crear trigger que se ejecute después de INSERT
CREATE TRIGGER trigger_crear_movimiento_caja_venta
    AFTER INSERT ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION crear_movimiento_caja_venta();

-- ================================
-- VERIFICAR TRIGGER CREADO
-- ================================

SELECT 
    'VERIFICACIÓN TRIGGER' as verificacion,
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name = 'trigger_crear_movimiento_caja_venta' THEN '✅ TRIGGER CREADO'
        ELSE '❌ TRIGGER NO CREADO'
    END as estado
FROM information_schema.triggers 
WHERE event_object_table = 'ventas'
    AND trigger_name = 'trigger_crear_movimiento_caja_venta';

-- ================================
-- PRUEBA DEL TRIGGER
-- ================================

-- Crear una venta de prueba para verificar que el trigger funciona
DO $$
DECLARE
    venta_id UUID;
    cliente_id UUID;
    empleado_id UUID;
BEGIN
    -- Obtener IDs de ejemplo
    SELECT id INTO cliente_id FROM clientes LIMIT 1;
    SELECT id INTO empleado_id FROM empleados LIMIT 1;
    
    -- Insertar venta de prueba
    INSERT INTO ventas (
        cliente_id,
        empleado_id,
        total,
        metodo_pago,
        tipo_precio,
        estado,
        fecha
    ) VALUES (
        cliente_id,
        empleado_id,
        2500.00,
        'efectivo',
        'precio_venta',
        'activa',
        NOW()
    ) RETURNING id INTO venta_id;
    
    RAISE NOTICE '✅ Venta de prueba creada con ID: %', venta_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error al crear venta de prueba: %', SQLERRM;
END $$;

-- ================================
-- VERIFICAR MOVIMIENTO CREADO
-- ================================

SELECT 
    'VERIFICACIÓN MOVIMIENTO' as verificacion,
    id,
    tipo,
    monto,
    concepto,
    empleado_id,
    fecha,
    created_at,
    CASE 
        WHEN concepto LIKE '%Venta #%' THEN '✅ MOVIMIENTO DE VENTA'
        ELSE 'ℹ️ OTRO MOVIMIENTO'
    END as tipo_movimiento
FROM movimientos_caja 
ORDER BY created_at DESC 
LIMIT 3;

-- ================================
-- RESUMEN FINAL
-- ================================

SELECT 
    'RESUMEN FINAL' as verificacion,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_table = 'ventas'
            AND trigger_name = 'trigger_crear_movimiento_caja_venta'
        ) THEN '✅ TRIGGER IMPLEMENTADO EXITOSAMENTE'
        ELSE '❌ ERROR EN LA IMPLEMENTACIÓN'
    END as estado_trigger,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM movimientos_caja 
            WHERE concepto LIKE '%Venta #%'
            AND created_at >= NOW() - INTERVAL '5 minutes'
        ) THEN '✅ MOVIMIENTO CREADO AUTOMÁTICAMENTE'
        ELSE '❌ NO SE CREÓ MOVIMIENTO'
    END as estado_movimiento;


