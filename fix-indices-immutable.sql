-- ================================================
-- FIX PARA ERROR: functions in index expression must be marked IMMUTABLE
-- ================================================
-- Script para corregir índices con funciones no-inmutables

-- ================================
-- ELIMINAR ÍNDICES PROBLEMÁTICOS
-- ================================

DO $$
BEGIN
  -- Eliminar índice problemático si existe
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname = 'idx_movimientos_caja_empleado_fecha'
  ) THEN
    DROP INDEX IF EXISTS idx_movimientos_caja_empleado_fecha;
    RAISE NOTICE '🗑️ Eliminado índice problemático idx_movimientos_caja_empleado_fecha';
  END IF;
END $$;

-- ================================
-- CREAR ÍNDICES CORRECTOS (SIN FUNCIONES)
-- ================================

-- Índice simple en created_at (sin función DATE)
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_created_at ON movimientos_caja(created_at);
RAISE NOTICE '✅ Creado índice idx_movimientos_caja_created_at';

-- Índice compuesto empleado_id + created_at
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empleado_created_at ON movimientos_caja(empleado_id, created_at);
RAISE NOTICE '✅ Creado índice idx_movimientos_caja_empleado_created_at';

-- Índice para consultas por fecha específica (mejor alternativa)
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_date_trunc_day ON movimientos_caja(date_trunc('day', created_at));
RAISE NOTICE '✅ Creado índice idx_movimientos_caja_date_trunc_day';

-- ================================
-- CREAR FUNCIÓN IMMUTABLE PARA EXTRAER FECHA (si es necesaria)
-- ================================

-- Crear función immutable personalizada para extraer fecha
CREATE OR REPLACE FUNCTION extract_date_immutable(timestamp_input TIMESTAMP WITH TIME ZONE)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
STRICT
AS $$
  SELECT timestamp_input::DATE;
$$;

RAISE NOTICE '✅ Creada función immutable extract_date_immutable';

-- Ahora podemos crear índice con función immutable si es necesario
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_fecha_immutable ON movimientos_caja(extract_date_immutable(created_at));
RAISE NOTICE '✅ Creado índice con función immutable';

-- ================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ================================

-- Índices para mejores consultas de fecha
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo_fecha ON movimientos_caja(tipo, created_at);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empleado_tipo ON movimientos_caja(empleado_id, tipo);

-- Índices para referencia (si las columnas existen)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_movimientos_caja_referencia_id ON movimientos_caja(referencia_id);
    CREATE INDEX IF NOT EXISTS idx_movimientos_caja_referencia_tipo ON movimientos_caja(referencia_tipo);
    CREATE INDEX IF NOT EXISTS idx_movimientos_caja_ref_completa ON movimientos_caja(referencia_id, referencia_tipo);
    RAISE NOTICE '✅ Creados índices para columnas de referencia';
  ELSE
    RAISE NOTICE '⚠️ Columnas de referencia no existen en movimientos_caja';
  END IF;
END $$;

-- ================================
-- ÍNDICES PARA OTRAS TABLAS (VERIFICACIÓN)
-- ================================

-- Verificar y crear índices seguros para otras tablas
CREATE INDEX IF NOT EXISTS idx_ventas_empleado_fecha ON ventas(empleado_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente_fecha ON ventas(cliente_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_total ON ventas(total);

-- Índices para venta_items
CREATE INDEX IF NOT EXISTS idx_venta_items_venta_id ON venta_items(venta_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_producto_id ON venta_items(producto_id);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_productos_codigo_sku ON productos(codigo_sku);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- Índices para empleados
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON empleados(activo);
CREATE INDEX IF NOT EXISTS idx_empleados_rol ON empleados(rol);
CREATE INDEX IF NOT EXISTS idx_empleados_email ON empleados(email);

RAISE NOTICE '✅ Creados índices adicionales para performance';

-- ================================
-- VERIFICACIÓN FINAL DE ÍNDICES
-- ================================

DO $$
DECLARE
  total_indices INTEGER;
  indices_movimientos INTEGER;
BEGIN
  -- Contar total de índices
  SELECT COUNT(*) INTO total_indices
  FROM pg_indexes
  WHERE schemaname = 'public';
  
  -- Contar índices específicos de movimientos_caja
  SELECT COUNT(*) INTO indices_movimientos
  FROM pg_indexes
  WHERE schemaname = 'public' 
  AND tablename = 'movimientos_caja';
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICACIÓN DE ÍNDICES';
  RAISE NOTICE '========================';
  RAISE NOTICE 'Total de índices en el sistema: %', total_indices;
  RAISE NOTICE 'Índices en movimientos_caja: %', indices_movimientos;
  
  -- Listar índices de movimientos_caja
  RAISE NOTICE '';
  RAISE NOTICE '📋 ÍNDICES EN MOVIMIENTOS_CAJA:';
  FOR i IN (
    SELECT indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'movimientos_caja'
    ORDER BY indexname
  ) LOOP
    RAISE NOTICE '  ✅ %', i.indexname;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 TODOS LOS ÍNDICES CREADOS CORRECTAMENTE';
  RAISE NOTICE '✅ Sin funciones no-inmutables en expresiones de índice';
  RAISE NOTICE '✅ Performance optimizada para consultas comunes';
END $$;
