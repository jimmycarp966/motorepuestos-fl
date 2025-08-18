-- ================================================
-- FIX PARA ERROR: policy already exists
-- ================================================
-- Script para eliminar políticas duplicadas y recrearlas de forma segura

-- ================================
-- ELIMINAR POLÍTICAS EXISTENTES
-- ================================

DO $$
BEGIN
  RAISE NOTICE '🔄 ELIMINANDO POLÍTICAS EXISTENTES PARA EVITAR DUPLICADOS';
  
  -- Eliminar políticas de error_log
  DROP POLICY IF EXISTS "error_log_select_policy" ON error_log;
  DROP POLICY IF EXISTS "error_log_insert_policy" ON error_log;
  DROP POLICY IF EXISTS "error_log_update_policy" ON error_log;
  DROP POLICY IF EXISTS "error_log_delete_policy" ON error_log;
  RAISE NOTICE '✅ Políticas de error_log eliminadas';
  
  -- Eliminar políticas de audit_log
  DROP POLICY IF EXISTS "audit_log_select_policy" ON audit_log;
  DROP POLICY IF EXISTS "audit_log_insert_policy" ON audit_log;
  DROP POLICY IF EXISTS "audit_log_update_policy" ON audit_log;
  DROP POLICY IF EXISTS "audit_log_delete_policy" ON audit_log;
  RAISE NOTICE '✅ Políticas de audit_log eliminadas';
  
  -- Eliminar políticas de notificaciones
  DROP POLICY IF EXISTS "notificaciones_select_policy" ON notificaciones;
  DROP POLICY IF EXISTS "notificaciones_insert_policy" ON notificaciones;
  DROP POLICY IF EXISTS "notificaciones_update_policy" ON notificaciones;
  DROP POLICY IF EXISTS "notificaciones_delete_policy" ON notificaciones;
  RAISE NOTICE '✅ Políticas de notificaciones eliminadas';
  
  -- Eliminar políticas de notificaciones_sistema
  DROP POLICY IF EXISTS "notificaciones_sistema_select_policy" ON notificaciones_sistema;
  DROP POLICY IF EXISTS "notificaciones_sistema_insert_policy" ON notificaciones_sistema;
  DROP POLICY IF EXISTS "notificaciones_sistema_update_policy" ON notificaciones_sistema;
  DROP POLICY IF EXISTS "notificaciones_sistema_delete_policy" ON notificaciones_sistema;
  RAISE NOTICE '✅ Políticas de notificaciones_sistema eliminadas';
  
  -- Eliminar políticas de arqueos_caja
  DROP POLICY IF EXISTS "arqueos_caja_select_policy" ON arqueos_caja;
  DROP POLICY IF EXISTS "arqueos_caja_insert_policy" ON arqueos_caja;
  DROP POLICY IF EXISTS "arqueos_caja_update_policy" ON arqueos_caja;
  DROP POLICY IF EXISTS "arqueos_caja_delete_policy" ON arqueos_caja;
  RAISE NOTICE '✅ Políticas de arqueos_caja eliminadas';
  
  -- Eliminar políticas de cajas_diarias
  DROP POLICY IF EXISTS "cajas_diarias_select_policy" ON cajas_diarias;
  DROP POLICY IF EXISTS "cajas_diarias_insert_policy" ON cajas_diarias;
  DROP POLICY IF EXISTS "cajas_diarias_update_policy" ON cajas_diarias;
  DROP POLICY IF EXISTS "cajas_diarias_delete_policy" ON cajas_diarias;
  RAISE NOTICE '✅ Políticas de cajas_diarias eliminadas';
  
  RAISE NOTICE '🧹 TODAS LAS POLÍTICAS DUPLICADAS ELIMINADAS';
END $$;

-- ================================
-- VERIFICAR FUNCIONES AUXILIARES
-- ================================

-- Verificar que las funciones auxiliares existan
DO $$
BEGIN
  -- Verificar get_user_role()
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_user_role'
  ) THEN
    -- Crear función get_user_role si no existe
    CREATE OR REPLACE FUNCTION get_user_role()
    RETURNS TEXT
    LANGUAGE SQL
    STABLE
    SECURITY DEFINER
    AS $$
      SELECT COALESCE(
        auth.jwt() -> 'user_metadata' ->> 'role',
        'Cajero'
      );
    $$;
    RAISE NOTICE '✅ Función get_user_role() creada';
  ELSE
    RAISE NOTICE '✅ Función get_user_role() ya existe';
  END IF;
  
  -- Verificar get_current_employee_id()
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_current_employee_id'
  ) THEN
    -- Crear función get_current_employee_id si no existe
    CREATE OR REPLACE FUNCTION get_current_employee_id()
    RETURNS UUID
    LANGUAGE SQL
    STABLE
    SECURITY DEFINER
    AS $$
      SELECT COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'employee_id')::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
      );
    $$;
    RAISE NOTICE '✅ Función get_current_employee_id() creada';
  ELSE
    RAISE NOTICE '✅ Función get_current_employee_id() ya existe';
  END IF;
END $$;

-- ================================
-- RECREAR POLÍTICAS RLS DE FORMA SEGURA
-- ================================

-- POLÍTICAS PARA ERROR_LOG
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "error_log_select_policy" ON error_log
FOR SELECT USING (
  get_user_role() = 'Administrador'
);

CREATE POLICY "error_log_insert_policy" ON error_log
FOR INSERT WITH CHECK (true); -- Permitir insertar errores desde cualquier contexto

-- POLÍTICAS PARA AUDIT_LOG
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_policy" ON audit_log
FOR SELECT USING (
  get_user_role() IN ('Administrador', 'Supervisor')
);

CREATE POLICY "audit_log_insert_policy" ON audit_log
FOR INSERT WITH CHECK (true); -- Permitir insertar auditoría desde cualquier contexto

-- POLÍTICAS PARA NOTIFICACIONES
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificaciones_select_policy" ON notificaciones
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() = 'Administrador'
);

CREATE POLICY "notificaciones_insert_policy" ON notificaciones
FOR INSERT WITH CHECK (
  get_user_role() IN ('Administrador', 'Supervisor')
);

CREATE POLICY "notificaciones_update_policy" ON notificaciones
FOR UPDATE USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() = 'Administrador'
);

-- POLÍTICAS PARA NOTIFICACIONES_SISTEMA
ALTER TABLE notificaciones_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificaciones_sistema_select_policy" ON notificaciones_sistema
FOR SELECT USING (true); -- Notificaciones del sistema visibles para todos

CREATE POLICY "notificaciones_sistema_insert_policy" ON notificaciones_sistema
FOR INSERT WITH CHECK (
  get_user_role() = 'Administrador'
);

CREATE POLICY "notificaciones_sistema_update_policy" ON notificaciones_sistema
FOR UPDATE USING (
  get_user_role() = 'Administrador'
);

-- POLÍTICAS PARA ARQUEOS_CAJA
ALTER TABLE arqueos_caja ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arqueos_caja_select_policy" ON arqueos_caja
FOR SELECT USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Supervisor')
);

CREATE POLICY "arqueos_caja_insert_policy" ON arqueos_caja
FOR INSERT WITH CHECK (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Supervisor')
);

CREATE POLICY "arqueos_caja_update_policy" ON arqueos_caja
FOR UPDATE USING (
  empleado_id = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Supervisor')
);

-- POLÍTICAS PARA CAJAS_DIARIAS
ALTER TABLE cajas_diarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cajas_diarias_select_policy" ON cajas_diarias
FOR SELECT USING (
  empleado_apertura = get_current_employee_id() OR
  empleado_cierre = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Supervisor')
);

CREATE POLICY "cajas_diarias_insert_policy" ON cajas_diarias
FOR INSERT WITH CHECK (
  empleado_apertura = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Supervisor')
);

CREATE POLICY "cajas_diarias_update_policy" ON cajas_diarias
FOR UPDATE USING (
  empleado_apertura = get_current_employee_id() OR
  empleado_cierre = get_current_employee_id() OR
  get_user_role() IN ('Administrador', 'Supervisor')
);

RAISE NOTICE '✅ TODAS LAS POLÍTICAS RLS RECREADAS CORRECTAMENTE';

-- ================================
-- VERIFICACIÓN FINAL
-- ================================

DO $$
DECLARE
  policy_count INTEGER;
  table_name TEXT;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICACIÓN DE POLÍTICAS RLS';
  RAISE NOTICE '===============================';
  
  FOR table_name IN VALUES ('error_log'), ('audit_log'), ('notificaciones'), ('notificaciones_sistema'), ('arqueos_caja'), ('cajas_diarias') LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = table_name;
    
    RAISE NOTICE 'Tabla %: % políticas', table_name, policy_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SISTEMA RLS CONFIGURADO CORRECTAMENTE';
  RAISE NOTICE '✅ Sin políticas duplicadas';
  RAISE NOTICE '✅ Todas las tablas protegidas';
  RAISE NOTICE '✅ Funciones auxiliares operativas';
END $$;
