-- ================================================
-- FIX SIMPLE - SIN FUNCIONES EN ÍNDICES
-- ================================================
-- Eliminar índices problemáticos y usar solo índices simples

-- ================================
-- ELIMINAR ÍNDICES PROBLEMÁTICOS
-- ================================

DROP INDEX IF EXISTS idx_movimientos_caja_empleado_fecha;
DROP INDEX IF EXISTS idx_movimientos_caja_fecha_immutable;
DROP INDEX IF EXISTS idx_movimientos_caja_date_trunc_day;

-- ================================
-- CREAR SOLO ÍNDICES SIMPLES (SIN FUNCIONES)
-- ================================

-- Índices básicos que SÍ funcionan sin problemas
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_created_at ON movimientos_caja(created_at);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empleado_created_at ON movimientos_caja(empleado_id, created_at);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo ON movimientos_caja(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empleado_tipo ON movimientos_caja(empleado_id, tipo);

-- Otros índices útiles sin funciones
CREATE INDEX IF NOT EXISTS idx_ventas_created_at ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_empleado_created_at ON ventas(empleado_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_total ON ventas(total);

CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);

CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON empleados(activo);
CREATE INDEX IF NOT EXISTS idx_empleados_rol ON empleados(rol);

DO $$ BEGIN 
  RAISE NOTICE '✅ ÍNDICES SIMPLES CREADOS - SIN FUNCIONES';
  RAISE NOTICE '🚀 SISTEMA COMPLETAMENTE FUNCIONAL';
  RAISE NOTICE '⚡ Performance buena para consultas normales';
  RAISE NOTICE '💡 Para consultas por fecha usar: created_at >= fecha AND created_at < fecha+1';
END $$;
