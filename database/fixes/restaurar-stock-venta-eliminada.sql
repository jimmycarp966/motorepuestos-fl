-- ================================================
-- FUNCIÓN: RESTAURAR STOCK AL ELIMINAR VENTA
-- ================================================
-- Esta función restaura el stock de todos los productos
-- cuando se elimina una venta

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

        -- Registrar en log de auditoría
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
-- Este trigger se ejecuta automáticamente cuando
-- una venta se marca como eliminada

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
-- VERIFICACIÓN DE LA FUNCIÓN
-- ================================================

-- Comentarios sobre el uso:
-- 1. La función se ejecuta automáticamente cuando una venta se marca como eliminada
-- 2. Restaura el stock de todos los productos de la venta
-- 3. Registra cada restauración en el log de auditoría
-- 4. Maneja errores individuales sin afectar otros productos
-- 5. Devuelve un reporte detallado del proceso

-- Para probar manualmente:
-- SELECT restaurar_stock_venta_eliminada('uuid-de-la-venta');
