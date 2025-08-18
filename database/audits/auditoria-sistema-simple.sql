-- ================================================
-- AUDIT TRAIL SIMPLIFICADO - VERSION CORREGIDA
-- ================================================

-- Crear esquema de auditoría
CREATE SCHEMA IF NOT EXISTS audit;

-- Tabla principal de auditoría (simplificada)
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla_nombre TEXT NOT NULL,
    operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id TEXT NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    datos_cambios JSONB,
    empleado_id UUID, -- Sin foreign key por ahora
    ip_address INET,
    user_agent TEXT,
    sesion_id TEXT,
    timestamp_operacion TIMESTAMPTZ DEFAULT NOW(),
    metadatos JSONB DEFAULT '{}'
);

-- Función genérica para crear trigger de auditoría (simplificada)
CREATE OR REPLACE FUNCTION audit.create_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changes_data JSONB;
    current_sesion_id TEXT;
BEGIN
    -- Intentar obtener sesión actual
    BEGIN
        current_sesion_id := current_setting('app.current_session_id', TRUE);
    EXCEPTION WHEN OTHERS THEN
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
        sesion_id,
        metadatos
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        old_data,
        new_data,
        changes_data,
        current_sesion_id,
        jsonb_build_object(
            'schema', TG_TABLE_SCHEMA,
            'timestamp', extract(epoch from now()),
            'transaction_id', txid_current()
        )
    );

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

-- Función simple para obtener historial de cambios
CREATE OR REPLACE FUNCTION audit.get_record_history(
    tabla_name TEXT,
    record_id TEXT,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    timestamp_operacion TIMESTAMPTZ,
    operacion TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    cambios JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.timestamp_operacion,
        al.operacion,
        al.datos_anteriores,
        al.datos_nuevos,
        al.datos_cambios as cambios
    FROM audit.audit_log al
    WHERE al.tabla_nombre = tabla_name 
      AND al.registro_id = record_id
    ORDER BY al.timestamp_operacion DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para estadísticas básicas
CREATE OR REPLACE FUNCTION audit.get_audit_stats()
RETURNS TABLE (
    tabla TEXT,
    total_operaciones BIGINT,
    inserts BIGINT,
    updates BIGINT,
    deletes BIGINT,
    ultima_operacion TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.tabla_nombre as tabla,
        COUNT(*) as total_operaciones,
        COUNT(*) FILTER (WHERE al.operacion = 'INSERT') as inserts,
        COUNT(*) FILTER (WHERE al.operacion = 'UPDATE') as updates,
        COUNT(*) FILTER (WHERE al.operacion = 'DELETE') as deletes,
        MAX(al.timestamp_operacion) as ultima_operacion
    FROM audit.audit_log al
    GROUP BY al.tabla_nombre
    ORDER BY total_operaciones DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de limpieza simplificada
CREATE OR REPLACE FUNCTION audit.cleanup_old_records(
    days_to_keep INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit.audit_log
    WHERE timestamp_operacion < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit.audit_log(timestamp_operacion DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla_registro ON audit.audit_log(tabla_nombre, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_operacion ON audit.audit_log(operacion);

-- Habilitar RLS básico
ALTER TABLE audit.audit_log ENABLE ROW LEVEL SECURITY;

-- Política básica (todos los usuarios autenticados pueden leer)
CREATE POLICY audit_basic_read ON audit.audit_log
    FOR SELECT TO authenticated
    USING (true);

-- Solo servicios pueden escribir
CREATE POLICY audit_service_write ON audit.audit_log
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Notificación de instalación exitosa
DO $$
BEGIN
    RAISE NOTICE 'Sistema de auditoría simplificado instalado exitosamente';
    RAISE NOTICE 'Triggers aplicados a: productos, ventas, venta_items, clientes, empleados';
    RAISE NOTICE 'Funciones disponibles: get_record_history, get_audit_stats, cleanup_old_records';
    
    -- Probar función de estadísticas
    RAISE NOTICE 'Probando función de estadísticas...';
END $$;
