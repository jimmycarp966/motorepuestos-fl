-- ================================================
-- CREAR TABLAS FALTANTES PARA MOTOREPUESTOS FL
-- ================================================
-- Tablas necesarias para las funciones Edge y RLS

-- ================================
-- TABLA: ARQUEOS DE CAJA (crear primero)
-- ================================

CREATE TABLE IF NOT EXISTS arqueos_caja (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  fecha DATE NOT NULL,
  saldo_inicial DECIMAL(10,2) NOT NULL,
  total_ingresos DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_egresos DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_teorico DECIMAL(10,2) NOT NULL,
  monto_contado DECIMAL(10,2) NOT NULL,
  diferencia DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('cuadrado', 'sobrante', 'faltante')),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(empleado_id, fecha), -- Solo un arqueo por empleado por día
  CHECK (saldo_inicial >= 0),
  CHECK (total_ingresos >= 0),
  CHECK (total_egresos >= 0),
  CHECK (monto_contado >= 0)
);

-- ================================
-- TABLA: CAJAS DIARIAS
-- ================================

CREATE TABLE IF NOT EXISTS cajas_diarias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  fecha DATE NOT NULL,
  saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_final DECIMAL(10,2),
  total_ingresos DECIMAL(10,2) DEFAULT 0,
  total_egresos DECIMAL(10,2) DEFAULT 0,
  diferencia DECIMAL(10,2) DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
  arqueo_id UUID REFERENCES arqueos_caja(id),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(empleado_id, fecha), -- Solo una caja por empleado por día
  CHECK (saldo_inicial >= 0),
  CHECK (saldo_final IS NULL OR saldo_final >= 0)
);

-- ================================
-- TABLA: NOTIFICACIONES (si no existe)
-- ================================

CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empleado_id UUID REFERENCES empleados(id),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('success', 'error', 'warning', 'info', 'critico', 'sistema')),
  categoria TEXT NOT NULL CHECK (categoria IN ('ventas', 'inventario', 'caja', 'clientes', 'empleados', 'sistema', 'seguridad')),
  prioridad TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  leida BOOLEAN DEFAULT false,
  archivada BOOLEAN DEFAULT false,
  persistente BOOLEAN DEFAULT false,
  contexto JSONB,
  acciones JSONB,
  requiere_accion BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- TABLA: ERROR LOG (soporte para Edge Functions)
-- ================================

CREATE TABLE IF NOT EXISTS error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcion TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  empleado_id UUID REFERENCES empleados(id),
  parametros JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- TABLA: AUDIT LOG (soporte para Edge Functions)
-- ================================

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

-- ================================
-- TABLA: NOTIFICACIONES SISTEMA (soporte para Edge Functions)
-- ================================

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
-- ACTUALIZAR TABLA MOVIMIENTOS_CAJA (agregar campos faltantes)
-- ================================

-- Verificar si las columnas existen antes de agregarlas
DO $$ 
BEGIN
  -- Agregar referencia_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_id'
  ) THEN
    ALTER TABLE movimientos_caja ADD COLUMN referencia_id UUID;
  END IF;

  -- Agregar referencia_tipo si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_tipo'
  ) THEN
    ALTER TABLE movimientos_caja ADD COLUMN referencia_tipo TEXT;
  END IF;
END $$;

-- ================================
-- ÍNDICES PARA PERFORMANCE
-- ================================

-- Índices para cajas_diarias
CREATE INDEX IF NOT EXISTS idx_cajas_diarias_empleado_fecha ON cajas_diarias(empleado_id, fecha);
CREATE INDEX IF NOT EXISTS idx_cajas_diarias_fecha ON cajas_diarias(fecha);
CREATE INDEX IF NOT EXISTS idx_cajas_diarias_estado ON cajas_diarias(estado);

-- Índices para arqueos_caja
CREATE INDEX IF NOT EXISTS idx_arqueos_caja_empleado_fecha ON arqueos_caja(empleado_id, fecha);
CREATE INDEX IF NOT EXISTS idx_arqueos_caja_fecha ON arqueos_caja(fecha);
CREATE INDEX IF NOT EXISTS idx_arqueos_caja_estado ON arqueos_caja(estado);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_empleado ON notificaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON notificaciones(created_at);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_error_log_empleado ON error_log(empleado_id);
CREATE INDEX IF NOT EXISTS idx_error_log_funcion ON error_log(funcion);
CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON error_log(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_empleado ON audit_log(empleado_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla ON audit_log(tabla);
CREATE INDEX IF NOT EXISTS idx_audit_log_registro_id ON audit_log(registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Índices para movimientos_caja (mejorados)
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empleado_fecha ON movimientos_caja(empleado_id, created_at);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_referencia ON movimientos_caja(referencia_id, referencia_tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo ON movimientos_caja(tipo);

-- ================================
-- TRIGGERS PARA UPDATED_AT
-- ================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cajas_diarias
DROP TRIGGER IF EXISTS update_cajas_diarias_updated_at ON cajas_diarias;
CREATE TRIGGER update_cajas_diarias_updated_at
  BEFORE UPDATE ON cajas_diarias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para arqueos_caja
DROP TRIGGER IF EXISTS update_arqueos_caja_updated_at ON arqueos_caja;
CREATE TRIGGER update_arqueos_caja_updated_at
  BEFORE UPDATE ON arqueos_caja
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para notificaciones
DROP TRIGGER IF EXISTS update_notificaciones_updated_at ON notificaciones;
CREATE TRIGGER update_notificaciones_updated_at
  BEFORE UPDATE ON notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- POLÍTICAS RLS PARA NUEVAS TABLAS
-- ================================

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE cajas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE arqueos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para cajas_diarias
CREATE POLICY "cajas_diarias_select_policy" ON cajas_diarias
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Gerente')
);

CREATE POLICY "cajas_diarias_insert_policy" ON cajas_diarias
FOR INSERT WITH CHECK (
  empleado_id = get_current_employee_id() AND
  get_user_role() IN ('Administrador', 'Gerente', 'Cajero')
);

CREATE POLICY "cajas_diarias_update_policy" ON cajas_diarias
FOR UPDATE USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() = 'Administrador'
);

-- Políticas para arqueos_caja
CREATE POLICY "arqueos_caja_select_policy" ON arqueos_caja
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Gerente')
);

CREATE POLICY "arqueos_caja_insert_policy" ON arqueos_caja
FOR INSERT WITH CHECK (
  empleado_id = get_current_employee_id() AND
  get_user_role() IN ('Administrador', 'Gerente', 'Cajero')
);

-- Políticas para notificaciones
CREATE POLICY "notificaciones_select_policy" ON notificaciones
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  empleado_id IS NULL -- Notificaciones globales
);

CREATE POLICY "notificaciones_update_policy" ON notificaciones
FOR UPDATE USING (
  empleado_id = get_current_employee_id()
);

-- Limpiar políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "error_log_select_policy" ON error_log;
DROP POLICY IF EXISTS "audit_log_select_policy" ON audit_log;
DROP POLICY IF EXISTS "notificaciones_sistema_select_policy" ON notificaciones_sistema;

-- Políticas para error_log (solo admins)
CREATE POLICY "error_log_select_policy" ON error_log
FOR SELECT USING (
  get_user_role() = 'Administrador'
);

-- Políticas para audit_log
CREATE POLICY "audit_log_select_policy" ON audit_log
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Gerente')
);

-- Políticas para notificaciones_sistema
CREATE POLICY "notificaciones_sistema_select_policy" ON notificaciones_sistema
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  empleado_id IS NULL -- Notificaciones globales
);

CREATE POLICY "notificaciones_sistema_update_policy" ON notificaciones_sistema
FOR UPDATE USING (
  empleado_id = get_current_employee_id()
);

-- ================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ================================

COMMENT ON TABLE cajas_diarias IS 
'Registro diario de apertura y cierre de caja por empleado';

COMMENT ON TABLE arqueos_caja IS 
'Registro de arqueos de caja con diferencias y estados';

COMMENT ON TABLE notificaciones IS 
'Notificaciones persistentes del sistema para usuarios';

COMMENT ON TABLE error_log IS 
'Log de errores de funciones server-side para debugging';

COMMENT ON TABLE audit_log IS 
'Registro de auditoría para cambios críticos en el sistema';

COMMENT ON TABLE notificaciones_sistema IS 
'Notificaciones automáticas generadas por el sistema';

-- ================================
-- DATOS INICIALES (OPCIONAL)
-- ================================

-- Insertar tipos de notificación en una tabla de configuración si fuera necesario
-- Por ahora usamos CHECK constraints en las tablas

-- ================================
-- VERIFICACIÓN FINAL
-- ================================

-- Verificar que todas las tablas fueron creadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('cajas_diarias', 'arqueos_caja', 'notificaciones', 'error_log', 'audit_log', 'notificaciones_sistema');
  
  IF table_count = 6 THEN
    RAISE NOTICE '✅ Todas las tablas fueron creadas exitosamente';
  ELSE
    RAISE NOTICE '⚠️ Solo % de 6 tablas fueron creadas', table_count;
  END IF;
END $$;
