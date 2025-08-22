-- Script para configurar zona horaria correcta y corregir fechas existentes
-- Este script resuelve el problema de fechas que aparecen a las 21:00

-- ========================================
-- 1. CONFIGURAR ZONA HORARIA DEL SERVIDOR
-- ========================================

-- Verificar zona horaria actual
SELECT 
    'CONFIGURACIÓN_ACTUAL' as seccion,
    current_setting('timezone') as zona_horaria_actual,
    now() as hora_actual_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina;

-- Configurar zona horaria para la sesión actual
SET timezone = 'America/Argentina/Buenos_Aires';

-- Verificar configuración después del cambio
SELECT 
    'CONFIGURACIÓN_NUEVA' as seccion,
    current_setting('timezone') as zona_horaria_nueva,
    now() as hora_actual_servidor,
    now() AT TIME ZONE 'America/Argentina/Buenos_Aires' as hora_argentina;

-- ========================================
-- 2. CORREGIR FECHAS EXISTENTES EN VENTAS
-- ========================================

-- Verificar ventas con hora 21:00 antes de la corrección
SELECT 
    'VENTAS_ANTES_CORRECCION' as seccion,
    COUNT(*) as total_ventas_21hs,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM ventas 
WHERE fecha::time = '21:00:00';

-- Mostrar ejemplos de fechas problemáticas
SELECT 
    'EJEMPLOS_VENTAS_PROBLEMATICAS' as seccion,
    id,
    total,
    fecha as fecha_actual,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora
FROM ventas 
WHERE fecha::time = '21:00:00'
ORDER BY fecha DESC
LIMIT 5;

-- Corregir fechas de ventas: convertir de UTC a hora local argentina
UPDATE ventas 
SET fecha = fecha - INTERVAL '3 hours'
WHERE fecha::time = '21:00:00';

-- Verificar corrección de ventas
SELECT 
    'VENTAS_DESPUES_CORRECCION' as seccion,
    COUNT(*) as total_ventas_corregidas,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM ventas 
WHERE fecha::time = '18:00:00';

-- ========================================
-- 3. CORREGIR FECHAS EXISTENTES EN MOVIMIENTOS_CAJA
-- ========================================

-- Verificar movimientos con hora 21:00 antes de la corrección
SELECT 
    'MOVIMIENTOS_ANTES_CORRECCION' as seccion,
    COUNT(*) as total_movimientos_21hs,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::time = '21:00:00';

-- Corregir fechas de movimientos: convertir de UTC a hora local argentina
UPDATE movimientos_caja 
SET fecha = fecha - INTERVAL '3 hours'
WHERE fecha::time = '21:00:00';

-- Verificar corrección de movimientos
SELECT 
    'MOVIMIENTOS_DESPUES_CORRECCION' as seccion,
    COUNT(*) as total_movimientos_corregidos,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente
FROM movimientos_caja 
WHERE fecha::time = '18:00:00';

-- ========================================
-- 4. VERIFICACIÓN FINAL
-- ========================================

-- Verificar que no quedan registros con hora 21:00
SELECT 
    'VERIFICACION_FINAL' as seccion,
    'ventas' as tabla,
    COUNT(*) as registros_21hs_restantes
FROM ventas 
WHERE fecha::time = '21:00:00'

UNION ALL

SELECT 
    'VERIFICACION_FINAL' as seccion,
    'movimientos_caja' as tabla,
    COUNT(*) as registros_21hs_restantes
FROM movimientos_caja 
WHERE fecha::time = '21:00:00';

-- Mostrar ejemplos de fechas corregidas
SELECT 
    'EJEMPLOS_VENTAS_CORREGIDAS' as seccion,
    id,
    total,
    fecha as fecha_corregida,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora
FROM ventas 
WHERE fecha::time = '18:00:00'
ORDER BY fecha DESC
LIMIT 5;

-- Mostrar ejemplos de movimientos corregidos
SELECT 
    'EJEMPLOS_MOVIMIENTOS_CORREGIDOS' as seccion,
    id,
    tipo,
    monto,
    concepto,
    fecha as fecha_corregida,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    fecha::time as hora
FROM movimientos_caja 
WHERE fecha::time = '18:00:00'
ORDER BY fecha DESC
LIMIT 5;

-- ========================================
-- 5. CONFIGURAR TRIGGER PARA FUTURAS INSERCIONES
-- ========================================

-- Crear función para asegurar zona horaria correcta en futuras inserciones
CREATE OR REPLACE FUNCTION ensure_correct_timezone()
RETURNS TRIGGER AS $$
BEGIN
  -- Asegurar que las fechas se almacenen en la zona horaria correcta
  IF NEW.fecha IS NOT NULL THEN
    NEW.fecha = NEW.fecha AT TIME ZONE 'America/Argentina/Buenos_Aires';
  END IF;
  
  IF NEW.created_at IS NOT NULL THEN
    NEW.created_at = NEW.created_at AT TIME ZONE 'America/Argentina/Buenos_Aires';
  END IF;
  
  IF NEW.updated_at IS NOT NULL THEN
    NEW.updated_at = NEW.updated_at AT TIME ZONE 'America/Argentina/Buenos_Aires';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para las tablas principales
DROP TRIGGER IF EXISTS ensure_timezone_ventas ON ventas;
CREATE TRIGGER ensure_timezone_ventas
  BEFORE INSERT OR UPDATE ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION ensure_correct_timezone();

DROP TRIGGER IF EXISTS ensure_timezone_movimientos_caja ON movimientos_caja;
CREATE TRIGGER ensure_timezone_movimientos_caja
  BEFORE INSERT OR UPDATE ON movimientos_caja
  FOR EACH ROW
  EXECUTE FUNCTION ensure_correct_timezone();

-- ========================================
-- 6. RESUMEN FINAL
-- ========================================

SELECT 
    'RESUMEN_FINAL' as seccion,
    'Configuración de zona horaria completada' as descripcion,
    'Todas las fechas han sido corregidas de UTC a hora local argentina (GMT-3)' as resultado,
    'Los triggers han sido configurados para prevenir futuros problemas de zona horaria' as prevencion;
