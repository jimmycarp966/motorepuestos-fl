-- ================================================
-- AUDIT TRAIL COMPLETO - VERSION CORREGIDA
-- ================================================
-- Compatible con la estructura real de empleados

-- Crear esquema de auditoría
CREATE SCHEMA IF NOT EXISTS audit;

-- Tabla principal de auditoría
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_nombre TEXT NOT NULL,
    operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id TEXT NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    datos_cambios JSONB,
    empleado_id UUID REFERENCES public.empleados(id),
    ip_address INET,
    user_agent TEXT,
    sesion_id TEXT,
    timestamp_operacion TIMESTAMPTZ DEFAULT NOW(),
    metadatos JSONB DEFAULT '{}',
    CONSTRAINT audit_log_timestamp_idx UNIQUE (timestamp_operacion, id)
);

-- Tabla de auditoría de sesiones
CREATE TABLE IF NOT EXISTS audit.audit_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id TEXT UNIQUE NOT NULL,
    empleado_id UUID REFERENCES public.empleados(id),
    inicio_sesion TIMESTAMPTZ DEFAULT NOW(),
    fin_sesion TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    acciones_realizadas INTEGER DEFAULT 0,
    modulos_accedidos TEXT[] DEFAULT '{}',
    ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'expirada', 'forzada'))
);

-- Tabla de auditoría de accesos
CREATE TABLE IF NOT EXISTS audit.audit_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id TEXT REFERENCES audit.audit_sessions(sesion_id),
    modulo TEXT NOT NULL,
    accion TEXT NOT NULL,
    recurso TEXT,
    resultado TEXT CHECK (resultado IN ('permitido', 'denegado', 'error')),
    razon_denegacion TEXT,
    timestamp_acceso TIMESTAMPTZ DEFAULT NOW(),
    duracion_ms INTEGER,
    metadatos JSONB DEFAULT '{}'
);

-- Tabla de auditoría de errores
CREATE TABLE IF NOT EXISTS audit.audit_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id TEXT REFERENCES audit.audit_sessions(sesion_id),
    tipo_error TEXT NOT NULL,
    mensaje_error TEXT NOT NULL,
    stack_trace TEXT,
    contexto JSONB DEFAULT '{}',
    empleado_afectado UUID REFERENCES public.empleados(id),
    resuelto BOOLEAN DEFAULT FALSE,
    timestamp_error TIMESTAMPTZ DEFAULT NOW()
);

-- Función genérica para crear trigger de auditoría
CREATE OR REPLACE FUNCTION audit.create_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changes_data JSONB;
    current_empleado_id UUID;
    current_sesion_id TEXT;
BEGIN
    -- Obtener información del empleado actual
    BEGIN
        current_sesion_id := current_setting('app.current_session_id', TRUE);
        current_empleado_id := current_setting('app.current_empleado_id', TRUE)::UUID;
    EXCEPTION WHEN OTHERS THEN
        current_empleado_id := NULL;
        current_sesion_id := NULL;
    END;

    -- Preparar datos según el tipo de operación
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
        changes_data := old_data;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
        changes_data := new_data;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Calcular solo los campos que cambiaron
        SELECT jsonb_object_agg(key, value)
        INTO changes_data
        FROM (
            SELECT key, value
            FROM jsonb_each(new_data)
            WHERE NOT (old_data ? key AND old_data->>key = new_data->>key)
        ) as changed_fields;
    END IF;

    -- Insertar registro de auditoría
    INSERT INTO audit.audit_log (
        tabla_nombre,
        operacion,
        registro_id,
        datos_anteriores,
        datos_nuevos,
        datos_cambios,
        empleado_id,
        sesion_id,
        metadatos
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        old_data,
        new_data,
        changes_data,
        current_empleado_id,
        current_sesion_id,
        jsonb_build_object(
            'schema', TG_TABLE_SCHEMA,
            'timestamp', extract(epoch from now()),
            'transaction_id', txid_current()
        )
    );

    -- Actualizar contador de acciones en la sesión
    IF current_sesion_id IS NOT NULL THEN
        UPDATE audit.audit_sessions
        SET acciones_realizadas = acciones_realizadas + 1,
            ultima_actividad = NOW()
        WHERE sesion_id = current_sesion_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers a tablas críticas
DROP TRIGGER IF EXISTS audit_productos_trigger ON public.productos;
CREATE TRIGGER audit_productos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.productos
    FOR EACH ROW EXECUTE FUNCTION audit.create_audit_trigger();

DROP TRIGGER IF EXISTS audit_ventas_trigger ON public.ventas;
CREATE TRIGGER audit_ventas_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.ventas
    FOR EACH ROW EXECUTE FUNCTION audit.create_audit_trigger();

DROP TRIGGER IF EXISTS audit_venta_items_trigger ON public.venta_items;
CREATE TRIGGER audit_venta_items_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.venta_items
    FOR EACH ROW EXECUTE FUNCTION audit.create_audit_trigger();

DROP TRIGGER IF EXISTS audit_clientes_trigger ON public.clientes;
CREATE TRIGGER audit_clientes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION audit.create_audit_trigger();

DROP TRIGGER IF EXISTS audit_empleados_trigger ON public.empleados;
CREATE TRIGGER audit_empleados_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.empleados
    FOR EACH ROW EXECUTE FUNCTION audit.create_audit_trigger();

-- Función para obtener historial de cambios de un registro
CREATE OR REPLACE FUNCTION audit.get_record_history(
    tabla_name TEXT,
    record_id TEXT,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    timestamp_operacion TIMESTAMPTZ,
    operacion TEXT,
    empleado_nombre TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    cambios JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.timestamp_operacion,
        al.operacion,
        e.nombre as empleado_nombre,
        al.datos_anteriores,
        al.datos_nuevos,
        al.datos_cambios as cambios
    FROM audit.audit_log al
    LEFT JOIN public.empleados e ON al.empleado_id = e.id
    WHERE al.tabla_nombre = tabla_name 
      AND al.registro_id = record_id
    ORDER BY al.timestamp_operacion DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para reportes de actividad por empleado
CREATE OR REPLACE FUNCTION audit.get_employee_activity(
    empleado_id_param UUID,
    fecha_desde TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    fecha_hasta TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    fecha DATE,
    total_acciones BIGINT,
    tablas_modificadas TEXT[],
    operaciones JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.timestamp_operacion::DATE as fecha,
        COUNT(*) as total_acciones,
        array_agg(DISTINCT al.tabla_nombre) as tablas_modificadas,
        jsonb_object_agg(al.operacion, COUNT(*)) as operaciones
    FROM audit.audit_log al
    WHERE al.empleado_id = empleado_id_param
      AND al.timestamp_operacion BETWEEN fecha_desde AND fecha_hasta
    GROUP BY al.timestamp_operacion::DATE
    ORDER BY fecha DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para detectar actividad sospechosa (CORREGIDA)
CREATE OR REPLACE FUNCTION audit.detect_suspicious_activity(
    horas_atras INTEGER DEFAULT 24
)
RETURNS TABLE (
    empleado_id UUID,
    empleado_nombre TEXT,
    empleado_email TEXT,
    acciones_total BIGINT,
    eliminaciones BIGINT,
    modificaciones_fuera_horario BIGINT,
    accesos_fallidos BIGINT,
    riesgo_nivel TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH activity_stats AS (
        SELECT 
            al.empleado_id,
            COUNT(*) as total_acciones,
            COUNT(*) FILTER (WHERE al.operacion = 'DELETE') as eliminaciones,
            COUNT(*) FILTER (WHERE 
                EXTRACT(hour FROM al.timestamp_operacion) < 6 
                OR EXTRACT(hour FROM al.timestamp_operacion) > 22
            ) as fuera_horario,
            COALESCE(
                (SELECT COUNT(*) 
                 FROM audit.audit_access aa 
                 WHERE aa.sesion_id = al.sesion_id 
                   AND aa.resultado = 'denegado'), 
                0
            ) as accesos_fallidos
        FROM audit.audit_log al
        WHERE al.timestamp_operacion > NOW() - (horas_atras || ' hours')::INTERVAL
          AND al.empleado_id IS NOT NULL
        GROUP BY al.empleado_id
    )
    SELECT 
        ast.empleado_id,
        e.nombre as empleado_nombre,
        e.email as empleado_email,
        ast.total_acciones as acciones_total,
        ast.eliminaciones,
        ast.fuera_horario as modificaciones_fuera_horario,
        ast.accesos_fallidos,
        CASE 
            WHEN ast.eliminaciones > 10 OR ast.accesos_fallidos > 5 THEN 'ALTO'
            WHEN ast.fuera_horario > 20 OR ast.total_acciones > 200 THEN 'MEDIO'
            ELSE 'BAJO'
        END as riesgo_nivel
    FROM activity_stats ast
    LEFT JOIN public.empleados e ON ast.empleado_id = e.id
    WHERE ast.total_acciones > 0
    ORDER BY 
        CASE 
            WHEN ast.eliminaciones > 10 OR ast.accesos_fallidos > 5 THEN 1
            WHEN ast.fuera_horario > 20 OR ast.total_acciones > 200 THEN 2
            ELSE 3
        END,
        ast.total_acciones DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para iniciar sesión de auditoría
CREATE OR REPLACE FUNCTION audit.start_session(
    empleado_id_param UUID,
    ip_address_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    new_session_id TEXT;
BEGIN
    -- Generar ID de sesión único
    new_session_id := 'sess_' || extract(epoch from now())::bigint || '_' || 
                     substr(md5(random()::text), 1, 8);
    
    -- Insertar nueva sesión
    INSERT INTO audit.audit_sessions (
        sesion_id,
        empleado_id,
        ip_address,
        user_agent
    ) VALUES (
        new_session_id,
        empleado_id_param,
        ip_address_param,
        user_agent_param
    );
    
    -- Establecer variables de sesión
    PERFORM set_config('app.current_session_id', new_session_id, FALSE);
    PERFORM set_config('app.current_empleado_id', empleado_id_param::TEXT, FALSE);
    
    RETURN new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cerrar sesión de auditoría
CREATE OR REPLACE FUNCTION audit.end_session(
    session_id_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE audit.audit_sessions
    SET fin_sesion = NOW(),
        estado = 'cerrada'
    WHERE sesion_id = session_id_param;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar acceso a módulo
CREATE OR REPLACE FUNCTION audit.log_module_access(
    modulo_param TEXT,
    accion_param TEXT,
    recurso_param TEXT DEFAULT NULL,
    resultado_param TEXT DEFAULT 'permitido',
    razon_denegacion_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_session_id TEXT;
BEGIN
    current_session_id := current_setting('app.current_session_id', TRUE);
    
    INSERT INTO audit.audit_access (
        sesion_id,
        modulo,
        accion,
        recurso,
        resultado,
        razon_denegacion
    ) VALUES (
        current_session_id,
        modulo_param,
        accion_param,
        recurso_param,
        resultado_param,
        razon_denegacion_param
    );
    
    -- Actualizar módulos accedidos en la sesión
    UPDATE audit.audit_sessions
    SET modulos_accedidos = array_append(
        CASE 
            WHEN modulo_param = ANY(modulos_accedidos) THEN modulos_accedidos
            ELSE modulos_accedidos
        END,
        CASE 
            WHEN modulo_param = ANY(modulos_accedidos) THEN NULL
            ELSE modulo_param
        END
    ),
    ultima_actividad = NOW()
    WHERE sesion_id = current_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista de resumen de actividad diaria
CREATE OR REPLACE VIEW audit.daily_activity_summary AS
SELECT 
    timestamp_operacion::DATE as fecha,
    tabla_nombre,
    operacion,
    COUNT(*) as total_operaciones,
    COUNT(DISTINCT empleado_id) as empleados_activos
FROM audit.audit_log
WHERE timestamp_operacion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY timestamp_operacion::DATE, tabla_nombre, operacion
ORDER BY fecha DESC, tabla_nombre, operacion;

-- Vista de sesiones activas
CREATE OR REPLACE VIEW audit.active_sessions AS
SELECT 
    s.*,
    e.nombre as empleado_nombre,
    e.email as empleado_email,
    NOW() - s.ultima_actividad as tiempo_inactivo
FROM audit.audit_sessions s
LEFT JOIN public.empleados e ON s.empleado_id = e.id
WHERE s.estado = 'activa'
  AND s.ultima_actividad > NOW() - INTERVAL '4 hours'
ORDER BY s.ultima_actividad DESC;

-- Función de limpieza automática
CREATE OR REPLACE FUNCTION audit.cleanup_old_records(
    days_to_keep INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar registros de auditoría antiguos
    DELETE FROM audit.audit_log
    WHERE timestamp_operacion < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Eliminar sesiones antiguas cerradas
    DELETE FROM audit.audit_sessions
    WHERE fin_sesion < NOW() - (days_to_keep || ' days')::INTERVAL
      AND estado != 'activa';
    
    -- Limpiar accesos antiguos
    DELETE FROM audit.audit_access
    WHERE timestamp_acceso < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- Limpiar errores resueltos antiguos
    DELETE FROM audit.audit_errors
    WHERE timestamp_error < NOW() - (days_to_keep || ' days')::INTERVAL
      AND resuelto = true;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit.audit_log(timestamp_operacion DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla_registro ON audit.audit_log(tabla_nombre, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_empleado ON audit.audit_log(empleado_id, timestamp_operacion DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_sesion ON audit.audit_log(sesion_id);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_empleado ON audit.audit_sessions(empleado_id);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_estado ON audit.audit_sessions(estado, ultima_actividad);
CREATE INDEX IF NOT EXISTS idx_audit_access_sesion ON audit.audit_access(sesion_id);
CREATE INDEX IF NOT EXISTS idx_audit_access_modulo ON audit.audit_access(modulo, timestamp_acceso DESC);

-- Habilitar RLS
ALTER TABLE audit.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.audit_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.audit_errors ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY audit_employee_access ON audit.audit_log
    FOR SELECT TO authenticated
    USING (
        empleado_id IS NULL OR 
        empleado_id IN (
            SELECT id FROM public.empleados
            WHERE email = auth.jwt()->>'email'
              AND activo = true
        )
    );

CREATE POLICY audit_admin_access ON audit.audit_log
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.empleados e
            WHERE e.email = auth.jwt()->>'email'
              AND e.rol = 'Administrador'
              AND e.activo = true
        )
    );

-- Notificación de instalación exitosa
DO $$
BEGIN
    RAISE NOTICE 'Sistema de auditoría completo (corregido) instalado exitosamente';
    RAISE NOTICE 'Tablas creadas: audit_log, audit_sessions, audit_access, audit_errors';
    RAISE NOTICE 'Triggers aplicados a: productos, ventas, venta_items, clientes, empleados';
    RAISE NOTICE 'Funciones disponibles: get_record_history, get_employee_activity, detect_suspicious_activity';
    RAISE NOTICE 'Compatible con estructura actual de empleados';
END $$;
