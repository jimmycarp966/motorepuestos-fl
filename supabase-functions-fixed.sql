-- Funciones RPC corregidas para el sistema de motorepuestos

-- Función para decrementar stock de productos
CREATE OR REPLACE FUNCTION decrementar_stock(
  producto_id UUID,
  cantidad INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar stock del producto
  UPDATE productos 
  SET stock = stock - cantidad,
      updated_at = NOW()
  WHERE id = producto_id;
  
  -- Verificar que el stock no sea negativo
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  -- Verificar stock suficiente (esto se hace después de la actualización para evitar race conditions)
  IF (SELECT stock FROM productos WHERE id = producto_id) < 0 THEN
    -- Revertir el cambio
    UPDATE productos 
    SET stock = stock + cantidad,
        updated_at = NOW()
    WHERE id = producto_id;
    RAISE EXCEPTION 'Stock insuficiente';
  END IF;
END;
$$;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION obtener_estadisticas_dashboard()
RETURNS TABLE(
  total_ventas BIGINT,
  total_ingresos NUMERIC,
  total_egresos NUMERIC,
  productos_bajo_stock BIGINT,
  clientes_activos BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM ventas WHERE DATE(fecha) = CURRENT_DATE) as total_ventas,
    (SELECT COALESCE(SUM(monto), 0) FROM caja_movimientos WHERE tipo = 'ingreso' AND DATE(fecha) = CURRENT_DATE) as total_ingresos,
    (SELECT COALESCE(SUM(monto), 0) FROM caja_movimientos WHERE tipo = 'egreso' AND DATE(fecha) = CURRENT_DATE) as total_egresos,
    (SELECT COUNT(*) FROM productos WHERE stock < 10 AND activo = true) as productos_bajo_stock,
    (SELECT COUNT(*) FROM clientes WHERE activo = true) as clientes_activos;
END;
$$;

-- Función para obtener ventas por período
CREATE OR REPLACE FUNCTION obtener_ventas_por_periodo(
  fecha_inicio DATE,
  fecha_fin DATE
)
RETURNS TABLE(
  fecha DATE,
  total_ventas BIGINT,
  monto_total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(v.fecha) as fecha,
    COUNT(*) as total_ventas,
    COALESCE(SUM(v.total), 0) as monto_total
  FROM ventas v
  WHERE DATE(v.fecha) BETWEEN fecha_inicio AND fecha_fin
  GROUP BY DATE(v.fecha)
  ORDER BY fecha;
END;
$$;

-- Función para obtener productos más vendidos
CREATE OR REPLACE FUNCTION obtener_productos_mas_vendidos(
  limite INTEGER DEFAULT 10
)
RETURNS TABLE(
  producto_id UUID,
  nombre_producto TEXT,
  categoria TEXT,
  cantidad_vendida BIGINT,
  monto_total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as producto_id,
    p.nombre as nombre_producto,
    p.categoria,
    COALESCE(SUM(vi.cantidad), 0) as cantidad_vendida,
    COALESCE(SUM(vi.subtotal), 0) as monto_total
  FROM productos p
  LEFT JOIN venta_items vi ON p.id = vi.producto_id
  WHERE p.activo = true
  GROUP BY p.id, p.nombre, p.categoria
  ORDER BY cantidad_vendida DESC
  LIMIT limite;
END;
$$;

-- Función para obtener movimientos de caja por período
CREATE OR REPLACE FUNCTION obtener_movimientos_caja_por_periodo(
  fecha_inicio DATE,
  fecha_fin DATE
)
RETURNS TABLE(
  fecha DATE,
  tipo_movimiento TEXT,
  total_ingresos NUMERIC,
  total_egresos NUMERIC,
  saldo_dia NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(cm.fecha) as fecha,
    cm.tipo as tipo_movimiento,
    CASE WHEN cm.tipo = 'ingreso' THEN cm.monto ELSE 0 END as total_ingresos,
    CASE WHEN cm.tipo = 'egreso' THEN cm.monto ELSE 0 END as total_egresos,
    SUM(CASE WHEN cm.tipo = 'ingreso' THEN cm.monto ELSE -cm.monto END) OVER (ORDER BY DATE(cm.fecha)) as saldo_dia
  FROM caja_movimientos cm
  WHERE DATE(cm.fecha) BETWEEN fecha_inicio AND fecha_fin
  ORDER BY fecha;
END;
$$;

-- Función para validar y registrar venta completa (transacción) - CORREGIDA
CREATE OR REPLACE FUNCTION registrar_venta_completa(
  p_cliente_id UUID DEFAULT NULL,
  p_empleado_id UUID DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE(
  venta_id UUID,
  total NUMERIC,
  mensaje TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_venta_id UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_producto_id UUID;
  v_cantidad INTEGER;
  v_precio NUMERIC;
  v_stock_actual INTEGER;
BEGIN
  -- Validar parámetros requeridos
  IF p_empleado_id IS NULL THEN
    RAISE EXCEPTION 'ID de empleado es requerido';
  END IF;
  
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La lista de items no puede estar vacía';
  END IF;

  -- Iniciar transacción
  BEGIN
    -- Validar items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_producto_id := (v_item->>'producto_id')::UUID;
      v_cantidad := (v_item->>'cantidad')::INTEGER;
      
      -- Verificar que el producto existe y tiene stock suficiente
      SELECT precio, stock INTO v_precio, v_stock_actual
      FROM productos
      WHERE id = v_producto_id AND activo = true;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado o inactivo: %', v_producto_id;
      END IF;
      
      IF v_stock_actual < v_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto: %', v_producto_id;
      END IF;
      
      v_total := v_total + (v_precio * v_cantidad);
    END LOOP;
    
    -- Crear venta
    INSERT INTO ventas (cliente_id, empleado_id, total, fecha)
    VALUES (p_cliente_id, p_empleado_id, v_total, NOW())
    RETURNING id INTO v_venta_id;
    
    -- Crear items de venta y actualizar stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_producto_id := (v_item->>'producto_id')::UUID;
      v_cantidad := (v_item->>'cantidad')::INTEGER;
      
      SELECT precio INTO v_precio
      FROM productos
      WHERE id = v_producto_id;
      
      -- Insertar item de venta
      INSERT INTO venta_items (venta_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES (v_venta_id, v_producto_id, v_cantidad, v_precio, v_precio * v_cantidad);
      
      -- Actualizar stock
      UPDATE productos 
      SET stock = stock - v_cantidad,
          updated_at = NOW()
      WHERE id = v_producto_id;
    END LOOP;
    
    -- Registrar ingreso en caja
    INSERT INTO caja_movimientos (tipo, monto, concepto, empleado_id, fecha)
    VALUES ('ingreso', v_total, 'Venta #' || v_venta_id, p_empleado_id, NOW());
    
    -- Retornar resultado
    RETURN QUERY SELECT v_venta_id, v_total, 'Venta registrada exitosamente'::TEXT;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback automático en caso de error
      RAISE EXCEPTION 'Error al registrar venta: %', SQLERRM;
  END;
END;
$$;

-- Comentarios sobre las funciones
COMMENT ON FUNCTION decrementar_stock(UUID, INTEGER) IS 'Decrementa el stock de un producto y valida que no sea negativo';
COMMENT ON FUNCTION obtener_estadisticas_dashboard() IS 'Obtiene estadísticas para el dashboard';
COMMENT ON FUNCTION obtener_ventas_por_periodo(DATE, DATE) IS 'Obtiene ventas agrupadas por fecha en un período';
COMMENT ON FUNCTION obtener_productos_mas_vendidos(INTEGER) IS 'Obtiene los productos más vendidos';
COMMENT ON FUNCTION obtener_movimientos_caja_por_periodo(DATE, DATE) IS 'Obtiene movimientos de caja por período';
COMMENT ON FUNCTION registrar_venta_completa(UUID, UUID, JSONB) IS 'Registra una venta completa con validaciones y transacciones';
