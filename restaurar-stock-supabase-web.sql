-- ================================================
-- SCRIPT PARA EJECUTAR EN SUPABASE WEB INTERFACE
-- ================================================
-- Copia y pega este script en la consola SQL de Supabase
-- (Dashboard > SQL Editor > New Query)

-- ================================================
-- FUNCIÓN: RESTAURAR STOCK AL ELIMINAR VENTA
-- ================================================

CREATE OR REPLACE FUNCTION restaurar_stock_venta_eliminada(
  p_venta_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item record;
  v_producto record;
  v_stock_restaurado numeric;
  v_items_procesados integer := 0;
  v_errores text[] := '{}';
  v_result json;
BEGIN
  -- Verificar que la venta existe y está marcada como eliminada
  IF NOT EXISTS (
    SELECT 1 FROM ventas 
    WHERE id = p_venta_id AND estado = 'eliminada'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Venta no encontrada o no está marcada como eliminada',
      'venta_id', p_venta_id
    );
  END IF;

  -- Procesar cada item de la venta
  FOR v_item IN 
    SELECT producto_id, cantidad 
    FROM venta_items 
    WHERE venta_id = p_venta_id
  LOOP
    BEGIN
      -- Obtener información del producto
      SELECT id, nombre, stock
      INTO v_producto
      FROM productos
      WHERE id = v_item.producto_id;

      IF FOUND THEN
        -- Restaurar stock
        UPDATE productos 
        SET 
          stock = stock + v_item.cantidad,
          updated_at = NOW()
        WHERE id = v_item.producto_id
        RETURNING stock INTO v_stock_restaurado;

        -- Registrar en log de auditoría (si existe la tabla)
        BEGIN
          INSERT INTO audit_log (
            tabla, 
            accion, 
            registro_id, 
            empleado_id, 
            datos_anteriores, 
            datos_nuevos,
            created_at
          ) VALUES (
            'productos',
            'stock_restore',
            v_item.producto_id,
            (SELECT empleado_id FROM ventas WHERE id = p_venta_id),
            jsonb_build_object('stock', v_stock_restaurado - v_item.cantidad),
            jsonb_build_object(
              'stock', v_stock_restaurado, 
              'motivo', 'restauracion_venta_eliminada',
              'venta_id', p_venta_id,
              'cantidad_restaurada', v_item.cantidad
            ),
            NOW()
          );
        EXCEPTION
          WHEN undefined_table THEN
            -- Si no existe la tabla audit_log, continuar sin error
            NULL;
        END;

        v_items_procesados := v_items_procesados + 1;
        
        RAISE NOTICE '✅ Stock restaurado: Producto % (%), +% unidades, nuevo stock: %', 
          v_producto.nombre, v_item.producto_id, v_item.cantidad, v_stock_restaurado;
      ELSE
        v_errores := v_errores || format('Producto no encontrado: %s', v_item.producto_id);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        v_errores := v_errores || format('Error restaurando stock de producto %s: %s', v_item.producto_id, SQLERRM);
    END;
  END LOOP;

  -- Construir resultado
  v_result := json_build_object(
    'success', array_length(v_errores, 1) = 0,
    'venta_id', p_venta_id,
    'items_procesados', v_items_procesados,
    'errores', v_errores,
    'timestamp', NOW()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'venta_id', p_venta_id,
      'timestamp', NOW()
    );
END;
$$;

-- ================================================
-- TRIGGER: RESTAURAR STOCK AUTOMÁTICAMENTE
-- ================================================

CREATE OR REPLACE FUNCTION trigger_restaurar_stock_venta_eliminada()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo restaurar stock si el estado cambió a 'eliminada'
  IF NEW.estado = 'eliminada' AND (OLD.estado IS NULL OR OLD.estado != 'eliminada') THEN
    -- Llamar a la función de restauración
    PERFORM restaurar_stock_venta_eliminada(NEW.id);
    
    RAISE NOTICE '🔄 Trigger ejecutado: Restaurando stock para venta eliminada #%', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_restaurar_stock_venta_eliminada ON ventas;

CREATE TRIGGER trigger_restaurar_stock_venta_eliminada
  AFTER UPDATE ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_restaurar_stock_venta_eliminada();

-- ================================================
-- VERIFICACIÓN
-- ================================================

-- Verificar que las funciones se crearon correctamente
SELECT 
  'Función creada' as estado,
  proname as nombre_funcion
FROM pg_proc 
WHERE proname IN ('restaurar_stock_venta_eliminada', 'trigger_restaurar_stock_venta_eliminada');

-- Verificar que el trigger se creó
SELECT 
  'Trigger creado' as estado,
  tgname as nombre_trigger,
  tgrelid::regclass as tabla
FROM pg_trigger 
WHERE tgname = 'trigger_restaurar_stock_venta_eliminada';

-- ================================================
-- INSTRUCCIONES
-- ================================================
-- ✅ Este script se ejecuta UNA SOLA VEZ
-- ✅ Después de ejecutarlo, el trigger funciona AUTOMÁTICAMENTE
-- ✅ Cada vez que elimines una venta, el stock se restaurará solo
-- ✅ No necesitas hacer nada más
