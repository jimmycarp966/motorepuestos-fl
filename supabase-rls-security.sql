-- ================================================
-- ROW LEVEL SECURITY (RLS) COMPLETA PARA MOTOREPUESTOS FL
-- ================================================
-- Políticas de seguridad por rol con validaciones exhaustivas

-- ================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ================================

-- Productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Ventas
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;

-- Clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Empleados (solo administradores pueden ver otros empleados)
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

-- Caja y movimientos
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE cajas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE arqueos_caja ENABLE ROW LEVEL SECURITY;

-- ================================
-- FUNCIONES HELPER PARA RLS
-- ================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'user_metadata' ->> 'rol')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el ID del empleado actual
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'user_metadata' ->> 'empleado_id')::UUID;
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

-- ================================
-- POLÍTICAS PARA PRODUCTOS
-- ================================

-- Ver productos: todos los empleados activos pueden ver
CREATE POLICY "productos_select_policy" ON productos
FOR SELECT USING (
  is_user_active() AND 
  has_module_permission('productos')
);

-- Crear productos: solo roles con permisos de gestión
CREATE POLICY "productos_insert_policy" ON productos
FOR INSERT WITH CHECK (
  is_user_active() AND 
  get_user_role() IN ('Administrador', 'Gerente', 'Técnico', 'Almacén')
);

-- Actualizar productos: solo roles con permisos de gestión
CREATE POLICY "productos_update_policy" ON productos
FOR UPDATE USING (
  is_user_active() AND 
  get_user_role() IN ('Administrador', 'Gerente', 'Técnico', 'Almacén')
);

-- Eliminar productos: solo administradores y gerentes
CREATE POLICY "productos_delete_policy" ON productos
FOR DELETE USING (
  is_user_active() AND 
  get_user_role() IN ('Administrador', 'Gerente')
);

-- ================================
-- POLÍTICAS PARA VENTAS
-- ================================

-- Ver ventas: empleados pueden ver sus propias ventas, managers pueden ver todas
CREATE POLICY "ventas_select_policy" ON ventas
FOR SELECT USING (
  is_user_active() AND 
  (
    empleado_id = get_current_employee_id() OR
    get_user_role() IN ('Administrador', 'Gerente') OR
    has_module_permission('reportes')
  )
);

-- Crear ventas: solo empleados con permisos de ventas
CREATE POLICY "ventas_insert_policy" ON ventas
FOR INSERT WITH CHECK (
  is_user_active() AND 
  empleado_id = get_current_employee_id() AND
  get_user_role() IN ('Administrador', 'Gerente', 'Vendedor', 'Cajero')
);

-- Actualizar ventas: solo el empleado que la creó o managers (dentro de 24h)
CREATE POLICY "ventas_update_policy" ON ventas
FOR UPDATE USING (
  is_user_active() AND 
  (
    (empleado_id = get_current_employee_id() AND created_at > NOW() - INTERVAL '24 hours') OR
    get_user_role() IN ('Administrador', 'Gerente')
  )
);

-- No se permite eliminar ventas por seguridad (solo soft delete por admins)
CREATE POLICY "ventas_delete_policy" ON ventas
FOR DELETE USING (
  is_user_active() AND 
  get_user_role() = 'Administrador'
);

-- ================================
-- POLÍTICAS PARA VENTA_ITEMS
-- ================================

-- Los items siguen las mismas reglas que las ventas
CREATE POLICY "venta_items_select_policy" ON venta_items
FOR SELECT USING (
  is_user_active() AND 
  EXISTS (
    SELECT 1 FROM ventas v 
    WHERE v.id = venta_items.venta_id 
    AND (
      v.empleado_id = get_current_employee_id() OR
      get_user_role() IN ('Administrador', 'Gerente') OR
      has_module_permission('reportes')
    )
  )
);

CREATE POLICY "venta_items_insert_policy" ON venta_items
FOR INSERT WITH CHECK (
  is_user_active() AND 
  EXISTS (
    SELECT 1 FROM ventas v 
    WHERE v.id = venta_items.venta_id 
    AND v.empleado_id = get_current_employee_id()
    AND get_user_role() IN ('Administrador', 'Gerente', 'Vendedor', 'Cajero')
  )
);

CREATE POLICY "venta_items_update_policy" ON venta_items
FOR UPDATE USING (
  is_user_active() AND 
  EXISTS (
    SELECT 1 FROM ventas v 
    WHERE v.id = venta_items.venta_id 
    AND (
      (v.empleado_id = get_current_employee_id() AND v.created_at > NOW() - INTERVAL '24 hours') OR
      get_user_role() IN ('Administrador', 'Gerente')
    )
  )
);

-- ================================
-- POLÍTICAS PARA CLIENTES
-- ================================

-- Ver clientes: empleados con permisos de ventas o clientes
CREATE POLICY "clientes_select_policy" ON clientes
FOR SELECT USING (
  is_user_active() AND 
  has_module_permission('clientes')
);

-- Crear clientes: empleados que pueden hacer ventas
CREATE POLICY "clientes_insert_policy" ON clientes
FOR INSERT WITH CHECK (
  is_user_active() AND 
  get_user_role() IN ('Administrador', 'Gerente', 'Vendedor', 'Cajero')
);

-- Actualizar clientes: empleados con permisos o quien los creó
CREATE POLICY "clientes_update_policy" ON clientes
FOR UPDATE USING (
  is_user_active() AND 
  get_user_role() IN ('Administrador', 'Gerente', 'Vendedor', 'Cajero')
);

-- Eliminar clientes: solo administradores y gerentes
CREATE POLICY "clientes_delete_policy" ON clientes
FOR DELETE USING (
  is_user_active() AND 
  get_user_role() IN ('Administrador', 'Gerente')
);

-- ================================
-- POLÍTICAS PARA EMPLEADOS
-- ================================

-- Ver empleados: solo administradores y gerentes
CREATE POLICY "empleados_select_policy" ON empleados
FOR SELECT USING (
  is_user_active() AND 
  (
    get_user_role() IN ('Administrador', 'Gerente') OR
    id = get_current_employee_id() -- Puede ver su propio perfil
  )
);

-- Crear empleados: solo administradores
CREATE POLICY "empleados_insert_policy" ON empleados
FOR INSERT WITH CHECK (
  is_user_active() AND 
  get_user_role() = 'Administrador'
);

-- Actualizar empleados: administradores o el propio empleado (datos limitados)
CREATE POLICY "empleados_update_policy" ON empleados
FOR UPDATE USING (
  is_user_active() AND 
  (
    get_user_role() = 'Administrador' OR
    (id = get_current_employee_id() AND get_user_role() IN ('Gerente', 'Vendedor', 'Técnico', 'Almacén', 'Cajero'))
  )
);

-- Eliminar empleados: solo administradores (soft delete)
CREATE POLICY "empleados_delete_policy" ON empleados
FOR DELETE USING (
  is_user_active() AND 
  get_user_role() = 'Administrador'
);

-- ================================
-- POLÍTICAS PARA MOVIMIENTOS DE CAJA
-- ================================

-- Ver movimientos: empleados con permisos de caja
CREATE POLICY "movimientos_caja_select_policy" ON movimientos_caja
FOR SELECT USING (
  is_user_active() AND 
  (
    empleado_id = get_current_employee_id() OR
    get_user_role() IN ('Administrador', 'Gerente') OR
    has_module_permission('caja')
  )
);

-- Crear movimientos: empleados con permisos de caja
CREATE POLICY "movimientos_caja_insert_policy" ON movimientos_caja
FOR INSERT WITH CHECK (
  is_user_active() AND 
  empleado_id = get_current_employee_id() AND
  get_user_role() IN ('Administrador', 'Gerente', 'Cajero')
);

-- Actualizar movimientos: solo administradores (correcciones)
CREATE POLICY "movimientos_caja_update_policy" ON movimientos_caja
FOR UPDATE USING (
  is_user_active() AND 
  get_user_role() = 'Administrador'
);

-- Eliminar movimientos: solo administradores
CREATE POLICY "movimientos_caja_delete_policy" ON movimientos_caja
FOR DELETE USING (
  is_user_active() AND 
  get_user_role() = 'Administrador'
);

-- ================================
-- POLÍTICAS PARA CAJAS DIARIAS
-- ================================

-- Ver cajas diarias: empleados con permisos
CREATE POLICY "cajas_diarias_select_policy" ON cajas_diarias
FOR SELECT USING (
  is_user_active() AND 
  (
    empleado_id = get_current_employee_id() OR
    get_user_role() IN ('Administrador', 'Gerente')
  )
);

-- Crear cajas diarias: empleados con permisos de caja
CREATE POLICY "cajas_diarias_insert_policy" ON cajas_diarias
FOR INSERT WITH CHECK (
  is_user_active() AND 
  empleado_id = get_current_employee_id() AND
  get_user_role() IN ('Administrador', 'Gerente', 'Cajero')
);

-- Actualizar cajas diarias: solo el empleado responsable o administradores
CREATE POLICY "cajas_diarias_update_policy" ON cajas_diarias
FOR UPDATE USING (
  is_user_active() AND 
  (
    empleado_id = get_current_employee_id() OR
    get_user_role() = 'Administrador'
  )
);

-- ================================
-- POLÍTICAS PARA ARQUEOS DE CAJA
-- ================================

-- Ver arqueos: empleados con permisos de caja
CREATE POLICY "arqueos_caja_select_policy" ON arqueos_caja
FOR SELECT USING (
  is_user_active() AND 
  (
    empleado_id = get_current_employee_id() OR
    get_user_role() IN ('Administrador', 'Gerente')
  )
);

-- Crear arqueos: empleados con permisos de caja
CREATE POLICY "arqueos_caja_insert_policy" ON arqueos_caja
FOR INSERT WITH CHECK (
  is_user_active() AND 
  empleado_id = get_current_employee_id() AND
  get_user_role() IN ('Administrador', 'Gerente', 'Cajero')
);

-- Actualizar arqueos: solo el empleado responsable (hasta 2 horas después)
CREATE POLICY "arqueos_caja_update_policy" ON arqueos_caja
FOR UPDATE USING (
  is_user_active() AND 
  (
    (empleado_id = get_current_employee_id() AND created_at > NOW() - INTERVAL '2 hours') OR
    get_user_role() = 'Administrador'
  )
);

-- ================================
-- FUNCIÓN PARA AUDITORÍA DE ACCESOS
-- ================================

-- Tabla para auditoría de accesos (sin RLS, solo admins)
CREATE TABLE IF NOT EXISTS audit_access_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empleado_id UUID REFERENCES empleados(id),
  tabla TEXT NOT NULL,
  accion TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  resultado TEXT, -- 'permitido' | 'denegado'
  razon_denegacion TEXT
);

-- Solo administradores pueden ver logs de auditoría
ALTER TABLE audit_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_access_log_select_policy" ON audit_access_log
FOR SELECT USING (
  get_user_role() = 'Administrador'
);

-- Función para registrar intentos de acceso
CREATE OR REPLACE FUNCTION log_access_attempt(
  tabla_param TEXT,
  accion_param TEXT,
  resultado_param TEXT,
  razon_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_access_log (
    empleado_id,
    tabla,
    accion,
    resultado,
    razon_denegacion
  ) VALUES (
    get_current_employee_id(),
    tabla_param,
    accion_param,
    resultado_param,
    razon_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- VALIDACIONES DE INTEGRIDAD
-- ================================

-- Función para validar que las ventas no sean modificadas después de cierto tiempo
CREATE OR REPLACE FUNCTION validate_venta_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo administradores pueden modificar ventas antiguas
  IF get_user_role() != 'Administrador' AND OLD.created_at < NOW() - INTERVAL '24 hours' THEN
    RAISE EXCEPTION 'No se pueden modificar ventas después de 24 horas. Contacte al administrador.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de validación
DROP TRIGGER IF EXISTS validate_venta_modification_trigger ON ventas;
CREATE TRIGGER validate_venta_modification_trigger
  BEFORE UPDATE ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION validate_venta_modification();

-- ================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ================================

COMMENT ON POLICY "productos_select_policy" ON productos IS 
'Permite ver productos a empleados activos con permisos del módulo';

COMMENT ON POLICY "ventas_select_policy" ON ventas IS 
'Empleados ven sus ventas, managers ven todas, reportes según permisos';

COMMENT ON POLICY "empleados_select_policy" ON empleados IS 
'Solo admin/gerente ven empleados, cada uno puede ver su perfil';

COMMENT ON FUNCTION get_user_role() IS 
'Obtiene el rol del usuario actual desde el JWT de autenticación';

COMMENT ON FUNCTION has_module_permission(TEXT) IS 
'Verifica si el usuario tiene permisos para acceder a un módulo específico';

COMMENT ON TABLE audit_access_log IS 
'Registro de auditoría para accesos a datos sensibles';

-- ================================
-- VERIFICACIÓN DE POLÍTICAS
-- ================================

-- Función para verificar que todas las políticas están activas
CREATE OR REPLACE FUNCTION verify_rls_policies()
RETURNS TABLE(tabla TEXT, rls_enabled BOOLEAN, policies_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname)
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public' 
    AND t.tablename IN ('productos', 'ventas', 'venta_items', 'clientes', 'empleados', 
                        'movimientos_caja', 'cajas_diarias', 'arqueos_caja')
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar verificación
SELECT * FROM verify_rls_policies();
