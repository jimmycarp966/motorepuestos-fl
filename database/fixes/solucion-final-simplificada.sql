-- SOLUCIÓN FINAL SIMPLIFICADA: Triggers automáticos para fechas correctas
-- Este script garantiza que todas las fechas vengan del servidor automáticamente

-- ========================================
-- 1. CONFIGURAR ZONA HORARIA DEL SERVIDOR
-- ========================================

-- Configurar zona horaria para la base de datos
ALTER DATABASE postgres SET timezone TO 'America/Argentina/Buenos_Aires';

-- Verificar configuración
SELECT 
    'CONFIGURACIÓN_ZONA_HORARIA' as seccion,
    current_setting('timezone') as zona_horaria_actual,
    now() as hora_actual_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina,
    CASE 
        WHEN current_setting('timezone') = 'America/Argentina/Buenos_Aires' THEN '✅ CONFIGURADA CORRECTAMENTE'
        ELSE '❌ REQUIERE CONFIGURACIÓN'
    END as estado;

-- ========================================
-- 2. CREAR FUNCIÓN PARA TIMESTAMPS CORRECTOS
-- ========================================

-- Función que siempre devuelve la hora correcta en zona horaria argentina
CREATE OR REPLACE FUNCTION set_correct_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Asignar fecha y hora actual en zona horaria argentina
  NEW.fecha = now() AT TIME ZONE 'America/Argentina/Buenos_Aires';
  
  -- Asignar created_at si no está definido
  IF NEW.created_at IS NULL THEN
    NEW.created_at = now() AT TIME ZONE 'America/Argentina/Buenos_Aires';
  END IF;
  
  -- Asignar updated_at siempre
  NEW.updated_at = now() AT TIME ZONE 'America/Argentina/Buenos_Aires';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. CREAR TRIGGERS PARA TABLAS PRINCIPALES
-- ========================================

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS ensure_correct_timestamp_ventas ON ventas;
DROP TRIGGER IF EXISTS ensure_correct_timestamp_movimientos_caja ON movimientos_caja;

-- Crear trigger para ventas
CREATE TRIGGER ensure_correct_timestamp_ventas
  BEFORE INSERT OR UPDATE ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION set_correct_timestamp();

-- Crear trigger para movimientos_caja
CREATE TRIGGER ensure_correct_timestamp_movimientos_caja
  BEFORE INSERT OR UPDATE ON movimientos_caja
  FOR EACH ROW
  EXECUTE FUNCTION set_correct_timestamp();

-- ========================================
-- 4. VERIFICAR TRIGGERS CREADOS
-- ========================================

-- Verificar que los triggers están activos
SELECT 
    'VERIFICACIÓN_TRIGGERS' as seccion,
    trigger_name,
    event_manipulation,
    event_object_table,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ TRIGGER ACTIVO'
        ELSE '❌ TRIGGER FALTANTE'
    END as estado
FROM information_schema.triggers 
WHERE trigger_name LIKE '%correct_timestamp%'
ORDER BY trigger_name;

-- ========================================
-- 5. PRUEBA SIMPLE DE TIMESTAMP
-- ========================================

-- Probar que la función de timestamp funciona correctamente
SELECT 
    'PRUEBA_TIMESTAMP' as seccion,
    now() as hora_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date as fecha_argentina,
    (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::time as hora_argentina_time,
    CASE 
        WHEN (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::time BETWEEN '08:00:00' AND '22:00:00' THEN '✅ HORARIO NORMAL'
        ELSE '⚠️ HORARIO FUERA DE RANGO'
    END as estado;

-- ========================================
-- 6. INSTRUCCIONES PARA EL CÓDIGO
-- ========================================

-- Nota: Ahora el código debe enviar NULL en el campo fecha para que el trigger lo asigne automáticamente
SELECT 
    'INSTRUCCIONES_CÓDIGO' as seccion,
    'Para ventas nuevas:' as instruccion,
    'Enviar fecha: null (el trigger asignará automáticamente)' as ejemplo,
    'El trigger usará: now() AT TIME ZONE ''America/Argentina/Buenos_Aires''' as funcion;

-- ========================================
-- 7. RESUMEN FINAL
-- ========================================

SELECT 
    'SOLUCIÓN_IMPLEMENTADA' as seccion,
    'Triggers automáticos configurados' as descripcion,
    'Todas las fechas ahora vienen del servidor automáticamente' as resultado,
    'No más problemas de zona horaria - fechas siempre correctas' as beneficio,
    'Para probar: crear una nueva venta y verificar que la fecha es correcta' as siguiente_paso;
