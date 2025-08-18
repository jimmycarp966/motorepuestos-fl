-- ================================================
-- EDGE FUNCTIONS PARA VALIDACIÓN SERVER-SIDE
-- ================================================
-- Funciones PostgreSQL para lógica de negocio crítica

-- ================================
-- FUNCIÓN: VALIDAR Y PROCESAR VENTA COMPLETA
-- ================================

CREATE OR REPLACE FUNCTION procesar_venta_completa(
  p_cliente_id UUID,
  p_empleado_id UUID,
  p_items JSONB,
  p_descuento DECIMAL DEFAULT 0,
  p_metodo_pago TEXT DEFAULT 'efectivo'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_venta_id UUID;
  v_item JSONB;
  v_producto RECORD;
  v_subtotal DECIMAL := 0;
  v_total DECIMAL := 0;
  v_item_id UUID;
  v_result JSONB;
  v_stock_actual INTEGER;
  v_movimiento_id UUID;
BEGIN
  -- Validaciones iniciales
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La venta debe tener al menos un producto'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_empleado_id IS NULL THEN
    RAISE EXCEPTION 'Se requiere un empleado para registrar la venta'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Verificar que el empleado existe y está activo
  IF NOT EXISTS (
    SELECT 1 FROM empleados 
    WHERE id = p_empleado_id AND activo = true
  ) THEN
    RAISE EXCEPTION 'Empleado no válido o inactivo'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Verificar cliente si se proporciona
  IF p_cliente_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clientes 
    WHERE id = p_cliente_id AND activo = true
  ) THEN
    RAISE EXCEPTION 'Cliente no válido o inactivo'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Generar ID de venta
  v_venta_id := gen_random_uuid();

  -- Procesar cada item y validar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Validar estructura del item
    IF NOT (v_item ? 'producto_id' AND v_item ? 'cantidad' AND v_item ? 'precio_unitario') THEN
      RAISE EXCEPTION 'Item de venta inválido: faltan campos requeridos'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Obtener información del producto
    SELECT id, nombre, stock, stock_minimo, precio_minorista, precio_mayorista, activo
    INTO v_producto
    FROM productos
    WHERE id = (v_item->>'producto_id')::UUID;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'producto_id'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF NOT v_producto.activo THEN
      RAISE EXCEPTION 'Producto inactivo: %', v_producto.nombre
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Validar cantidad
    IF (v_item->>'cantidad')::INTEGER <= 0 THEN
      RAISE EXCEPTION 'Cantidad inválida para producto %', v_producto.nombre
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Verificar stock disponible
    IF v_producto.stock < (v_item->>'cantidad')::INTEGER THEN
      RAISE EXCEPTION 'Stock insuficiente para %. Disponible: %, Solicitado: %', 
        v_producto.nombre, v_producto.stock, (v_item->>'cantidad')::INTEGER
        USING ERRCODE = 'insufficient_stock';
    END IF;

    -- Validar precio (no puede ser menor que el precio mayorista)
    IF (v_item->>'precio_unitario')::DECIMAL < v_producto.precio_mayorista THEN
      RAISE EXCEPTION 'Precio unitario muy bajo para %. Mínimo: %', 
        v_producto.nombre, v_producto.precio_mayorista
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Acumular subtotal
    v_subtotal := v_subtotal + ((v_item->>'cantidad')::INTEGER * (v_item->>'precio_unitario')::DECIMAL);
  END LOOP;

  -- Calcular total
  v_total := v_subtotal - COALESCE(p_descuento, 0);

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'El total de la venta debe ser mayor a cero'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Iniciar transacción (ya estamos en una función que es atómica)
  
  -- 1. Crear el registro de venta
  INSERT INTO ventas (
    id, cliente_id, empleado_id, subtotal, descuento, total, metodo_pago, created_at
  ) VALUES (
    v_venta_id, p_cliente_id, p_empleado_id, v_subtotal, p_descuento, v_total, p_metodo_pago, NOW()
  );

  -- 2. Crear items de venta y actualizar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_id := gen_random_uuid();
    
    -- Insertar item de venta
    INSERT INTO venta_items (
      id, venta_id, producto_id, cantidad, precio_unitario, subtotal, tipo_precio
    ) VALUES (
      v_item_id,
      v_venta_id,
      (v_item->>'producto_id')::UUID,
      (v_item->>'cantidad')::INTEGER,
      (v_item->>'precio_unitario')::DECIMAL,
      (v_item->>'cantidad')::INTEGER * (v_item->>'precio_unitario')::DECIMAL,
      COALESCE(v_item->>'tipo_precio', 'minorista')
    );

    -- Actualizar stock del producto
    UPDATE productos 
    SET stock = stock - (v_item->>'cantidad')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item->>'producto_id')::UUID
    RETURNING stock INTO v_stock_actual;

    -- Log de auditoría para cambio de stock
    INSERT INTO audit_log (
      tabla, accion, registro_id, empleado_id, datos_anteriores, datos_nuevos
    ) VALUES (
      'productos',
      'stock_update',
      (v_item->>'producto_id')::UUID,
      p_empleado_id,
      jsonb_build_object('stock', v_stock_actual + (v_item->>'cantidad')::INTEGER),
      jsonb_build_object('stock', v_stock_actual, 'motivo', 'venta', 'venta_id', v_venta_id)
    );
  END LOOP;

  -- 3. Registrar movimiento de caja
  v_movimiento_id := gen_random_uuid();
  INSERT INTO movimientos_caja (
    id, tipo, monto, descripcion, empleado_id, referencia_id, referencia_tipo, created_at
  ) VALUES (
    v_movimiento_id,
    'ingreso',
    v_total,
    'Venta #' || SUBSTRING(v_venta_id::TEXT FROM 1 FOR 8),
    p_empleado_id,
    v_venta_id,
    'venta',
    NOW()
  );

  -- 4. Verificar productos con stock bajo y generar alertas
  INSERT INTO notificaciones_sistema (
    tipo, titulo, mensaje, categoria, prioridad, empleado_id, datos_contexto
  )
  SELECT 
    'warning',
    'Stock Bajo',
    'Producto "' || p.nombre || '" tiene stock bajo: ' || p.stock || ' unidades',
    'inventario',
    CASE WHEN p.stock = 0 THEN 'critica' ELSE 'alta' END,
    p_empleado_id,
    jsonb_build_object('producto_id', p.id, 'stock_actual', p.stock, 'stock_minimo', p.stock_minimo)
  FROM productos p
  WHERE p.stock <= p.stock_minimo
    AND p.id IN (
      SELECT (item->>'producto_id')::UUID 
      FROM jsonb_array_elements(p_items) AS item
    );

  -- Construir resultado
  v_result := jsonb_build_object(
    'success', true,
    'venta_id', v_venta_id,
    'total', v_total,
    'subtotal', v_subtotal,
    'descuento', p_descuento,
    'movimiento_caja_id', v_movimiento_id,
    'timestamp', NOW()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log del error
    INSERT INTO error_log (
      funcion, error_code, error_message, empleado_id, parametros
    ) VALUES (
      'procesar_venta_completa',
      SQLSTATE,
      SQLERRM,
      p_empleado_id,
      jsonb_build_object(
        'cliente_id', p_cliente_id,
        'empleado_id', p_empleado_id,
        'items_count', jsonb_array_length(p_items),
        'descuento', p_descuento,
        'metodo_pago', p_metodo_pago
      )
    );
    
    -- Re-lanzar la excepción
    RAISE;
END;
$$;

-- ================================
-- FUNCIÓN: PROCESAR ARQUEO DE CAJA
-- ================================

CREATE OR REPLACE FUNCTION procesar_arqueo_caja(
  p_empleado_id UUID,
  p_monto_contado DECIMAL,
  p_observaciones TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_fecha DATE;
  v_saldo_inicial DECIMAL := 0;
  v_total_ingresos DECIMAL := 0;
  v_total_egresos DECIMAL := 0;
  v_saldo_teorico DECIMAL := 0;
  v_diferencia DECIMAL := 0;
  v_estado TEXT;
  v_arqueo_id UUID;
  v_result JSONB;
  v_caja_abierta BOOLEAN := false;
BEGIN
  -- Validaciones iniciales
  IF p_empleado_id IS NULL THEN
    RAISE EXCEPTION 'Se requiere un empleado para realizar el arqueo'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_monto_contado < 0 THEN
    RAISE EXCEPTION 'El monto contado no puede ser negativo'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Verificar que el empleado tiene permisos
  IF NOT EXISTS (
    SELECT 1 FROM empleados 
    WHERE id = p_empleado_id 
      AND activo = true 
      AND rol IN ('Administrador', 'Gerente', 'Cajero')
  ) THEN
    RAISE EXCEPTION 'El empleado no tiene permisos para realizar arqueos'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_fecha := CURRENT_DATE;

  -- Verificar que no haya un arqueo previo para el día
  IF EXISTS (
    SELECT 1 FROM arqueos_caja 
    WHERE fecha = v_fecha 
      AND empleado_id = p_empleado_id
  ) THEN
    RAISE EXCEPTION 'Ya existe un arqueo para este empleado en la fecha %', v_fecha
      USING ERRCODE = 'duplicate_arqueo';
  END IF;

  -- Verificar que hay una caja diaria abierta
  SELECT EXISTS (
    SELECT 1 FROM cajas_diarias 
    WHERE fecha = v_fecha 
      AND empleado_id = p_empleado_id 
      AND estado = 'abierta'
  ) INTO v_caja_abierta;

  IF NOT v_caja_abierta THEN
    RAISE EXCEPTION 'No hay una caja abierta para realizar el arqueo'
      USING ERRCODE = 'no_open_cash_register';
  END IF;

  -- Obtener saldo inicial de la caja diaria
  SELECT saldo_inicial INTO v_saldo_inicial
  FROM cajas_diarias
  WHERE fecha = v_fecha 
    AND empleado_id = p_empleado_id 
    AND estado = 'abierta';

  -- Calcular totales de movimientos del día
  SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0)
  INTO v_total_ingresos, v_total_egresos
  FROM movimientos_caja
  WHERE DATE(created_at) = v_fecha
    AND empleado_id = p_empleado_id;

  -- Calcular saldo teórico
  v_saldo_teorico := v_saldo_inicial + v_total_ingresos - v_total_egresos;

  -- Calcular diferencia
  v_diferencia := p_monto_contado - v_saldo_teorico;

  -- Determinar estado (tolerancia de $1 peso)
  v_estado := CASE 
    WHEN ABS(v_diferencia) <= 1 THEN 'cuadrado'
    WHEN v_diferencia > 0 THEN 'sobrante'
    ELSE 'faltante'
  END;

  -- Generar ID del arqueo
  v_arqueo_id := gen_random_uuid();

  -- Insertar el arqueo
  INSERT INTO arqueos_caja (
    id, empleado_id, fecha, saldo_inicial, total_ingresos, total_egresos,
    saldo_teorico, monto_contado, diferencia, estado, observaciones, created_at
  ) VALUES (
    v_arqueo_id, p_empleado_id, v_fecha, v_saldo_inicial, v_total_ingresos,
    v_total_egresos, v_saldo_teorico, p_monto_contado, v_diferencia,
    v_estado, p_observaciones, NOW()
  );

  -- Cerrar la caja diaria
  UPDATE cajas_diarias
  SET estado = 'cerrada',
      saldo_final = p_monto_contado,
      total_ingresos = v_total_ingresos,
      total_egresos = v_total_egresos,
      diferencia = v_diferencia,
      arqueo_id = v_arqueo_id,
      updated_at = NOW()
  WHERE fecha = v_fecha 
    AND empleado_id = p_empleado_id 
    AND estado = 'abierta';

  -- Generar notificación si hay diferencia significativa
  IF ABS(v_diferencia) > 1 THEN
    INSERT INTO notificaciones_sistema (
      tipo, titulo, mensaje, categoria, prioridad, empleado_id, datos_contexto
    ) VALUES (
      'warning',
      'Diferencia en Arqueo',
      'Arqueo con diferencia de $' || v_diferencia || ' (' || v_estado || ')',
      'caja',
      CASE WHEN ABS(v_diferencia) > 100 THEN 'critica' ELSE 'alta' END,
      p_empleado_id,
      jsonb_build_object(
        'arqueo_id', v_arqueo_id,
        'diferencia', v_diferencia,
        'estado', v_estado,
        'fecha', v_fecha
      )
    );
  END IF;

  -- Log de auditoría
  INSERT INTO audit_log (
    tabla, accion, registro_id, empleado_id, datos_anteriores, datos_nuevos
  ) VALUES (
    'arqueos_caja',
    'create',
    v_arqueo_id,
    p_empleado_id,
    NULL,
    jsonb_build_object(
      'saldo_teorico', v_saldo_teorico,
      'monto_contado', p_monto_contado,
      'diferencia', v_diferencia,
      'estado', v_estado
    )
  );

  -- Construir resultado
  v_result := jsonb_build_object(
    'success', true,
    'arqueo_id', v_arqueo_id,
    'fecha', v_fecha,
    'saldo_inicial', v_saldo_inicial,
    'total_ingresos', v_total_ingresos,
    'total_egresos', v_total_egresos,
    'saldo_teorico', v_saldo_teorico,
    'monto_contado', p_monto_contado,
    'diferencia', v_diferencia,
    'estado', v_estado,
    'timestamp', NOW()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log del error
    INSERT INTO error_log (
      funcion, error_code, error_message, empleado_id, parametros
    ) VALUES (
      'procesar_arqueo_caja',
      SQLSTATE,
      SQLERRM,
      p_empleado_id,
      jsonb_build_object(
        'empleado_id', p_empleado_id,
        'monto_contado', p_monto_contado,
        'fecha', v_fecha
      )
    );
    
    -- Re-lanzar la excepción
    RAISE;
END;
$$;

-- ================================
-- FUNCIÓN: VALIDAR STOCK ANTES DE VENTA
-- ================================

CREATE OR REPLACE FUNCTION validar_stock_venta(
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_producto RECORD;
  v_result JSONB := '[]'::JSONB;
  v_item_result JSONB;
  v_total_items INTEGER := 0;
  v_items_validos INTEGER := 0;
BEGIN
  -- Validar que items no esté vacío
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No se proporcionaron items para validar'
    );
  END IF;

  v_total_items := jsonb_array_length(p_items);

  -- Validar cada item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Obtener información del producto
    SELECT id, nombre, stock, stock_minimo, activo
    INTO v_producto
    FROM productos
    WHERE id = (v_item->>'producto_id')::UUID;

    IF FOUND AND v_producto.activo THEN
      v_item_result := jsonb_build_object(
        'producto_id', v_producto.id,
        'nombre', v_producto.nombre,
        'cantidad_solicitada', (v_item->>'cantidad')::INTEGER,
        'stock_actual', v_producto.stock,
        'stock_disponible', v_producto.stock >= (v_item->>'cantidad')::INTEGER,
        'stock_suficiente', v_producto.stock >= (v_item->>'cantidad')::INTEGER,
        'stock_critico', v_producto.stock <= v_producto.stock_minimo,
        'stock_restante', v_producto.stock - (v_item->>'cantidad')::INTEGER
      );
      
      IF v_producto.stock >= (v_item->>'cantidad')::INTEGER THEN
        v_items_validos := v_items_validos + 1;
      END IF;
    ELSE
      v_item_result := jsonb_build_object(
        'producto_id', v_item->>'producto_id',
        'error', 'Producto no encontrado o inactivo',
        'stock_disponible', false
      );
    END IF;

    v_result := v_result || v_item_result;
  END LOOP;

  RETURN jsonb_build_object(
    'success', v_items_validos = v_total_items,
    'total_items', v_total_items,
    'items_validos', v_items_validos,
    'todos_disponibles', v_items_validos = v_total_items,
    'items', v_result
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- ================================
-- FUNCIÓN: OBTENER ANALYTICS DE VENTAS
-- ================================

CREATE OR REPLACE FUNCTION get_ventas_analytics(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_fecha_fin DATE DEFAULT CURRENT_DATE,
  p_empleado_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_ventas_total INTEGER;
  v_ingresos_total DECIMAL;
  v_ticket_promedio DECIMAL;
  v_productos_vendidos INTEGER;
  v_clientes_unicos INTEGER;
BEGIN
  -- Calcular métricas principales
  SELECT 
    COUNT(*),
    COALESCE(SUM(total), 0),
    COALESCE(AVG(total), 0),
    COUNT(DISTINCT cliente_id)
  INTO 
    v_ventas_total,
    v_ingresos_total,
    v_ticket_promedio,
    v_clientes_unicos
  FROM ventas v
  WHERE DATE(v.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin
    AND (p_empleado_id IS NULL OR v.empleado_id = p_empleado_id);

  -- Calcular productos vendidos
  SELECT COALESCE(SUM(vi.cantidad), 0)
  INTO v_productos_vendidos
  FROM venta_items vi
  JOIN ventas v ON vi.venta_id = v.id
  WHERE DATE(v.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin
    AND (p_empleado_id IS NULL OR v.empleado_id = p_empleado_id);

  -- Construir resultado
  v_result := jsonb_build_object(
    'periodo', jsonb_build_object(
      'inicio', p_fecha_inicio,
      'fin', p_fecha_fin
    ),
    'metricas', jsonb_build_object(
      'ventas_total', v_ventas_total,
      'ingresos_total', v_ingresos_total,
      'ticket_promedio', v_ticket_promedio,
      'productos_vendidos', v_productos_vendidos,
      'clientes_unicos', v_clientes_unicos
    ),
    'generado_en', NOW()
  );

  RETURN v_result;
END;
$$;

-- ================================
-- TABLAS DE SOPORTE PARA EDGE FUNCTIONS
-- ================================

-- Tabla para logs de errores
CREATE TABLE IF NOT EXISTS error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcion TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  empleado_id UUID REFERENCES empleados(id),
  parametros JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para auditoría
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tabla TEXT NOT NULL,
  accion TEXT NOT NULL,
  registro_id UUID,
  empleado_id UUID REFERENCES empleados(id),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para notificaciones del sistema
CREATE TABLE IF NOT EXISTS notificaciones_sistema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'warning', 'error', 'success')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  categoria TEXT NOT NULL,
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  empleado_id UUID REFERENCES empleados(id),
  leida BOOLEAN DEFAULT false,
  datos_contexto JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ================================
-- POLÍTICAS RLS PARA NUEVAS TABLAS
-- ================================

-- Error log (solo admins)
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "error_log_select_policy" ON error_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM empleados 
    WHERE id = (auth.jwt() -> 'user_metadata' ->> 'empleado_id')::UUID 
    AND rol = 'Administrador'
  )
);

-- Audit log (admins y el empleado que generó el log)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_policy" ON audit_log
FOR SELECT USING (
  empleado_id = (auth.jwt() -> 'user_metadata' ->> 'empleado_id')::UUID OR
  EXISTS (
    SELECT 1 FROM empleados 
    WHERE id = (auth.jwt() -> 'user_metadata' ->> 'empleado_id')::UUID 
    AND rol IN ('Administrador', 'Gerente')
  )
);

-- Notificaciones sistema (cada empleado ve las suyas)
ALTER TABLE notificaciones_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificaciones_sistema_select_policy" ON notificaciones_sistema
FOR SELECT USING (
  empleado_id = (auth.jwt() -> 'user_metadata' ->> 'empleado_id')::UUID OR
  empleado_id IS NULL -- Notificaciones globales
);

CREATE POLICY "notificaciones_sistema_update_policy" ON notificaciones_sistema
FOR UPDATE USING (
  empleado_id = (auth.jwt() -> 'user_metadata' ->> 'empleado_id')::UUID
);

-- ================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ================================

COMMENT ON FUNCTION procesar_venta_completa(UUID, UUID, JSONB, DECIMAL, TEXT) IS 
'Procesa una venta completa con validaciones, actualización de stock y registro de caja de forma atómica';

COMMENT ON FUNCTION procesar_arqueo_caja(UUID, DECIMAL, TEXT) IS 
'Realiza el arqueo completo de caja con validaciones y cierre automático';

COMMENT ON FUNCTION validar_stock_venta(JSONB) IS 
'Valida disponibilidad de stock para items de venta sin realizar cambios';

COMMENT ON FUNCTION get_ventas_analytics(DATE, DATE, UUID) IS 
'Genera analytics de ventas para un periodo específico con métricas de negocio';

COMMENT ON TABLE error_log IS 
'Registro de errores de las funciones server-side para debugging';

COMMENT ON TABLE audit_log IS 
'Registro de auditoría para cambios críticos en el sistema';

COMMENT ON TABLE notificaciones_sistema IS 
'Notificaciones generadas automáticamente por el sistema';
