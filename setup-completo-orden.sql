-- ================================================
-- SETUP COMPLETO MOTOREPUESTOS FL EN ORDEN CORRECTO
-- ================================================
-- Script que ejecuta todo en el orden correcto para evitar errores de dependencias

-- ================================
-- PASO 1: CREAR TABLAS FALTANTES
-- ================================

\echo '🚀 PASO 1: Creando tablas faltantes...'

-- Primero los arqueos (sin dependencias circulares)
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
  
  UNIQUE(empleado_id, fecha),
  CHECK (saldo_inicial >= 0),
  CHECK (total_ingresos >= 0),
  CHECK (total_egresos >= 0),
  CHECK (monto_contado >= 0)
);

-- Luego las cajas diarias
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
  
  UNIQUE(empleado_id, fecha),
  CHECK (saldo_inicial >= 0),
  CHECK (saldo_final IS NULL OR saldo_final >= 0)
);

-- Tablas de notificaciones
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

-- Tablas de log y auditoría
CREATE TABLE IF NOT EXISTS error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcion TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  empleado_id UUID REFERENCES empleados(id),
  parametros JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

\echo '✅ Tablas creadas exitosamente'

-- ================================
-- PASO 2: AGREGAR COLUMNAS FALTANTES
-- ================================

\echo '🔧 PASO 2: Agregando columnas faltantes...'

DO $$ 
BEGIN
  -- Agregar referencia_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_id'
  ) THEN
    ALTER TABLE movimientos_caja ADD COLUMN referencia_id UUID;
    RAISE NOTICE 'Agregada columna referencia_id a movimientos_caja';
  END IF;

  -- Agregar referencia_tipo si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_tipo'
  ) THEN
    ALTER TABLE movimientos_caja ADD COLUMN referencia_tipo TEXT;
    RAISE NOTICE 'Agregada columna referencia_tipo a movimientos_caja';
  END IF;

  -- Agregar permisos_modulos si no existe en empleados
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empleados' AND column_name = 'permisos_modulos'
  ) THEN
    ALTER TABLE empleados ADD COLUMN permisos_modulos TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Agregada columna permisos_modulos a empleados';
  END IF;
END $$;

\echo '✅ Columnas agregadas exitosamente'

-- ================================
-- PASO 3: FUNCIONES HELPER PARA RLS
-- ================================

\echo '🔐 PASO 3: Creando funciones helper para RLS...'

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'rol')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el ID del empleado actual
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'empleado_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario está activo
CREATE OR REPLACE FUNCTION is_user_active()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM empleados 
    WHERE id = get_current_employee_id() 
    AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos de módulo
CREATE OR REPLACE FUNCTION has_module_permission(module_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions TEXT[];
BEGIN
  SELECT permisos_modulos INTO user_permissions
  FROM empleados 
  WHERE id = get_current_employee_id();
  
  RETURN module_name = ANY(user_permissions) OR get_user_role() = 'Administrador';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo '✅ Funciones RLS creadas exitosamente'

-- ================================
-- PASO 4: CREAR ÍNDICES
-- ================================

\echo '⚡ PASO 4: Creando índices...'

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

-- Índices para movimientos_caja (mejorados)
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empleado_fecha ON movimientos_caja(empleado_id, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_referencia ON movimientos_caja(referencia_id, referencia_tipo);

\echo '✅ Índices creados exitosamente'

-- ================================
-- PASO 5: CREAR TRIGGERS
-- ================================

\echo '🔄 PASO 5: Creando triggers...'

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_cajas_diarias_updated_at ON cajas_diarias;
CREATE TRIGGER update_cajas_diarias_updated_at
  BEFORE UPDATE ON cajas_diarias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_arqueos_caja_updated_at ON arqueos_caja;
CREATE TRIGGER update_arqueos_caja_updated_at
  BEFORE UPDATE ON arqueos_caja
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notificaciones_updated_at ON notificaciones;
CREATE TRIGGER update_notificaciones_updated_at
  BEFORE UPDATE ON notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

\echo '✅ Triggers creados exitosamente'

-- ================================
-- PASO 6: HABILITAR RLS Y CREAR POLÍTICAS
-- ================================

\echo '🛡️ PASO 6: Configurando Row Level Security...'

-- Habilitar RLS
ALTER TABLE cajas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE arqueos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (simplificadas para evitar errores)
DROP POLICY IF EXISTS "cajas_diarias_all_policy" ON cajas_diarias;
CREATE POLICY "cajas_diarias_all_policy" ON cajas_diarias
FOR ALL USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Gerente')
);

DROP POLICY IF EXISTS "arqueos_caja_all_policy" ON arqueos_caja;
CREATE POLICY "arqueos_caja_all_policy" ON arqueos_caja
FOR ALL USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Gerente')
);

DROP POLICY IF EXISTS "notificaciones_all_policy" ON notificaciones;
CREATE POLICY "notificaciones_all_policy" ON notificaciones
FOR ALL USING (
  empleado_id = get_current_employee_id() OR
  empleado_id IS NULL OR
  get_user_role() IN ('Administrador', 'Gerente')
);

-- Políticas más restrictivas para logs
DROP POLICY IF EXISTS "error_log_select_policy" ON error_log;
CREATE POLICY "error_log_select_policy" ON error_log
FOR SELECT USING (
  get_user_role() = 'Administrador'
);

DROP POLICY IF EXISTS "audit_log_select_policy" ON audit_log;
CREATE POLICY "audit_log_select_policy" ON audit_log
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Gerente')
);

\echo '✅ RLS configurado exitosamente'

-- ================================
-- PASO 7: VERIFICACIÓN FINAL
-- ================================

\echo '🔍 PASO 7: Verificación final...'

DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
BEGIN
  -- Verificar tablas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('cajas_diarias', 'arqueos_caja', 'notificaciones', 'error_log', 'audit_log', 'notificaciones_sistema');
  
  -- Verificar funciones
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN ('get_user_role', 'get_current_employee_id', 'is_user_active', 'has_module_permission');
  
  RAISE NOTICE '✅ Tablas creadas: %/6', table_count;
  RAISE NOTICE '✅ Funciones RLS: %/4', function_count;
  
  IF table_count = 6 AND function_count = 4 THEN
    RAISE NOTICE '🎉 Setup completo exitoso - Sistema listo para Edge Functions';
  ELSE
    RAISE NOTICE '⚠️ Setup incompleto - revisar errores arriba';
  END IF;
END $$;

\echo ''
\echo '🚀 SETUP COMPLETO FINALIZADO'
\echo '=============================='
\echo '✅ Todas las dependencias están listas'
\echo '✅ Ahora puedes ejecutar:'
\echo '   - supabase-edge-functions.sql'
\echo '   - supabase-rls-security.sql (políticas adicionales)'
\echo ''
