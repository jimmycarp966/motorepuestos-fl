-- ================================================
-- FUNCIÓN SQL PARA REGISTRO ATÓMICO DE VENTAS
-- ================================================
-- Esta función garantiza atomicidad en el registro de ventas
-- incluyendo: venta, items, actualización de stock y caja

CREATE OR REPLACE FUNCTION registrar_venta_atomica(
  venta_data jsonb,
  items_data jsonb[]
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  nueva_venta record;
  item_data jsonb;
  producto_actual record;
  resultado json;
  total_calculado numeric := 0;
  items_procesados json[] := '{}';
BEGIN
  -- ================================================
  -- 1. VALIDACIONES PREVIAS
  -- ================================================
  
  -- Validar que hay items
  IF array_length(items_data, 1) IS NULL OR array_length(items_data, 1) = 0 THEN
    RAISE EXCEPTION 'La venta debe tener al menos un producto';
  END IF;

  -- Validar empleado existe y está activo
  IF NOT EXISTS (
    SELECT 1 FROM empleados 
    WHERE id = (venta_data->>'empleado_id')::uuid 
    AND activo = true
  ) THEN
    RAISE EXCEPTION 'Empleado no encontrado o inactivo';
  END IF;

  -- Validar cliente si se proporciona
  IF venta_data->>'cliente_id' IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM clientes 
      WHERE id = (venta_data->>'cliente_id')::uuid 
      AND activo = true
    ) THEN
      RAISE EXCEPTION 'Cliente no encontrado o inactivo';
    END IF;
  END IF;

  -- ================================================
  -- 2. CALCULAR TOTAL Y VALIDAR PRODUCTOS
  -- ================================================
  
  FOREACH item_data IN ARRAY items_data LOOP
    -- Verificar que el producto existe y está activo
    SELECT * INTO producto_actual 
    FROM productos 
    WHERE id = (item_data->>'producto_id')::uuid 
    AND activo = true;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto % no encontrado o inactivo', item_data->>'producto_id';
    END IF;

    -- Validar cantidad
    IF (item_data->>'cantidad')::numeric <= 0 THEN
      RAISE EXCEPTION 'La cantidad debe ser mayor a cero para producto %', producto_actual.nombre;
    END IF;

    -- Validar precio unitario
    IF (item_data->>'precio_unitario')::numeric <= 0 THEN
      RAISE EXCEPTION 'El precio unitario debe ser mayor a cero para producto %', producto_actual.nombre;
    END IF;

    -- Sumar al total
    total_calculado := total_calculado + (item_data->>'subtotal')::numeric;
  END LOOP;

  -- Validar que el total calculado coincide
  IF abs(total_calculado - (venta_data->>'total')::numeric) > 0.01 THEN
    RAISE EXCEPTION 'El total calculado (%) no coincide con el total enviado (%)', 
      total_calculado, venta_data->>'total';
  END IF;

  -- ================================================
  -- 3. CREAR LA VENTA (TRANSACCIÓN ATÓMICA)
  -- ================================================
  
  INSERT INTO ventas (
    cliente_id,
    empleado_id,
    total,
    fecha,
    metodo_pago,
    tipo_precio,
    estado,
    created_at,
    updated_at
  ) VALUES (
    CASE WHEN venta_data->>'cliente_id' = '' THEN NULL 
         ELSE (venta_data->>'cliente_id')::uuid END,
    (venta_data->>'empleado_id')::uuid,
    (venta_data->>'total')::numeric,
    COALESCE((venta_data->>'fecha')::date, CURRENT_DATE),
    COALESCE(venta_data->>'metodo_pago', 'efectivo'),
    COALESCE(venta_data->>'tipo_precio', 'minorista'),
    'completada',
    NOW(),
    NOW()
  ) RETURNING * INTO nueva_venta;

  -- ================================================
  -- 4. CREAR ITEMS DE VENTA Y ACTUALIZAR STOCK
  -- ================================================
  
  FOREACH item_data IN ARRAY items_data LOOP
    -- Insertar item de venta
    INSERT INTO venta_items (
      venta_id,
      producto_id,
      cantidad,
      precio_unitario,
      subtotal,
      tipo_precio,
      created_at
    ) VALUES (
      nueva_venta.id,
      (item_data->>'producto_id')::uuid,
      (item_data->>'cantidad')::numeric,
      (item_data->>'precio_unitario')::numeric,
      (item_data->>'subtotal')::numeric,
      COALESCE(item_data->>'tipo_precio', 'minorista'),
      NOW()
    );

    -- Actualizar stock del producto
    UPDATE productos 
    SET 
      stock = stock - (item_data->>'cantidad')::numeric,
      updated_at = NOW()
    WHERE id = (item_data->>'producto_id')::uuid;

    -- Agregar al array de items procesados para el resultado
    items_procesados := items_procesados || json_build_object(
      'producto_id', item_data->>'producto_id',
      'cantidad', item_data->>'cantidad',
      'subtotal', item_data->>'subtotal'
    );
  END LOOP;

  -- ================================================
  -- 5. REGISTRAR MOVIMIENTO DE CAJA
  -- ================================================
  
  -- Solo registrar en caja si no es cuenta corriente
  IF venta_data->>'metodo_pago' != 'cuenta_corriente' THEN
    INSERT INTO movimientos_caja (
      tipo,
      monto,
      concepto,
      empleado_id,
      fecha,
      metodo_pago,
      created_at
    ) VALUES (
      'ingreso',
      (venta_data->>'total')::numeric,
      'Venta #' || nueva_venta.id,
      (venta_data->>'empleado_id')::uuid,
      COALESCE((venta_data->>'fecha')::date, CURRENT_DATE),
      venta_data->>'metodo_pago',
      NOW()
    );
  END IF;

  -- ================================================
  -- 6. ACTUALIZAR CUENTA CORRIENTE DEL CLIENTE
  -- ================================================
  
  IF venta_data->>'metodo_pago' = 'cuenta_corriente' AND venta_data->>'cliente_id' IS NOT NULL THEN
    UPDATE clientes 
    SET 
      saldo_cuenta_corriente = saldo_cuenta_corriente + (venta_data->>'total')::numeric,
      updated_at = NOW()
    WHERE id = (venta_data->>'cliente_id')::uuid;
  END IF;

  -- ================================================
  -- 7. CONSTRUIR RESPUESTA DE ÉXITO
  -- ================================================
  
  resultado := json_build_object(
    'success', true,
    'venta', json_build_object(
      'id', nueva_venta.id,
      'total', nueva_venta.total,
      'fecha', nueva_venta.fecha,
      'metodo_pago', nueva_venta.metodo_pago,
      'estado', nueva_venta.estado,
      'created_at', nueva_venta.created_at
    ),
    'items_procesados', items_procesados,
    'mensaje', 'Venta registrada exitosamente',
    'timestamp', NOW()
  );

  RETURN resultado;

EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, la transacción se revierte automáticamente
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'mensaje', 'Error al procesar la venta: ' || SQLERRM,
      'timestamp', NOW()
    );
END;
$$;

-- ================================================
-- FUNCIÓN AUXILIAR: DECREMENTAR STOCK
-- ================================================

CREATE OR REPLACE FUNCTION decrement_stock(
  product_id uuid,
  quantity numeric
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_stock numeric;
BEGIN
  UPDATE productos 
  SET 
    stock = stock - quantity,
    updated_at = NOW()
  WHERE id = product_id
  RETURNING stock INTO new_stock;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado: %', product_id;
  END IF;
  
  RETURN new_stock;
END;
$$;

-- ================================================
-- FUNCIÓN DE VALIDACIÓN DE LÍMITE DE CRÉDITO
-- ================================================

CREATE OR REPLACE FUNCTION validar_limite_credito(
  cliente_id uuid,
  monto_venta numeric
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cliente_data record;
  nuevo_saldo numeric;
BEGIN
  -- Obtener datos del cliente
  SELECT * INTO cliente_data 
  FROM clientes 
  WHERE id = cliente_id AND activo = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valido', false,
      'mensaje', 'Cliente no encontrado o inactivo'
    );
  END IF;
  
  -- Calcular nuevo saldo
  nuevo_saldo := cliente_data.saldo_cuenta_corriente + monto_venta;
  
  -- Validar límite
  IF nuevo_saldo > cliente_data.limite_credito THEN
    RETURN json_build_object(
      'valido', false,
      'mensaje', 'Límite de crédito excedido',
      'limite', cliente_data.limite_credito,
      'saldo_actual', cliente_data.saldo_cuenta_corriente,
      'saldo_futuro', nuevo_saldo
    );
  END IF;
  
  RETURN json_build_object(
    'valido', true,
    'mensaje', 'Límite de crédito válido',
    'limite', cliente_data.limite_credito,
    'saldo_actual', cliente_data.saldo_cuenta_corriente,
    'saldo_futuro', nuevo_saldo
  );
END;
$$;

-- ================================================
-- FUNCIÓN PARA OBTENER RESUMEN DE CAJA DIARIA
-- ================================================

CREATE OR REPLACE FUNCTION obtener_resumen_caja(
  fecha_consulta date DEFAULT CURRENT_DATE
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resumen json;
  ingresos numeric := 0;
  egresos numeric := 0;
  saldo_dia numeric := 0;
  total_ventas numeric := 0;
  cantidad_movimientos integer := 0;
BEGIN
  -- Calcular ingresos del día
  SELECT COALESCE(SUM(monto), 0) INTO ingresos
  FROM movimientos_caja
  WHERE tipo = 'ingreso' 
  AND fecha = fecha_consulta;
  
  -- Calcular egresos del día
  SELECT COALESCE(SUM(monto), 0) INTO egresos
  FROM movimientos_caja
  WHERE tipo = 'egreso' 
  AND fecha = fecha_consulta;
  
  -- Calcular total de ventas
  SELECT COALESCE(SUM(total), 0) INTO total_ventas
  FROM ventas
  WHERE fecha = fecha_consulta
  AND estado = 'completada';
  
  -- Contar movimientos
  SELECT COUNT(*) INTO cantidad_movimientos
  FROM movimientos_caja
  WHERE fecha = fecha_consulta;
  
  saldo_dia := ingresos - egresos;
  
  resumen := json_build_object(
    'fecha', fecha_consulta,
    'ingresos', ingresos,
    'egresos', egresos,
    'saldo_dia', saldo_dia,
    'total_ventas', total_ventas,
    'cantidad_movimientos', cantidad_movimientos,
    'generado_en', NOW()
  );
  
  RETURN resumen;
END;
$$;

-- ================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ================================================

COMMENT ON FUNCTION registrar_venta_atomica(jsonb, jsonb[]) IS 
'Registra una venta de forma atómica incluyendo items, actualización de stock y movimiento de caja. 
Garantiza consistencia de datos mediante transacción SQL nativa.';

COMMENT ON FUNCTION decrement_stock(uuid, numeric) IS 
'Decrementa el stock de un producto de forma segura. 
Permite stock negativo para casos especiales de venta.';

COMMENT ON FUNCTION validar_limite_credito(uuid, numeric) IS 
'Valida si un cliente puede realizar una compra a cuenta corriente 
sin exceder su límite de crédito establecido.';

COMMENT ON FUNCTION obtener_resumen_caja(date) IS 
'Obtiene un resumen completo de los movimientos de caja para una fecha específica, 
incluyendo ingresos, egresos y estadísticas de ventas.';
