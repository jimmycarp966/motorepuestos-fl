-- Script para verificar y corregir fechas de movimientos de caja
-- Este script ayuda a identificar y corregir problemas de zona horaria

-- 1. Verificar la estructura de la tabla movimientos_caja
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar las fechas actuales en movimientos_caja
SELECT 
    id,
    tipo,
    monto,
    concepto,
    fecha,
    created_at,
    -- Mostrar la diferencia entre fecha y created_at
    EXTRACT(EPOCH FROM (fecha - created_at)) as diferencia_segundos,
    -- Mostrar la fecha en diferentes formatos
    fecha::date as fecha_solo,
    fecha::time as hora_solo,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    to_char(fecha AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') as fecha_utc,
    to_char(fecha AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD HH24:MI:SS') as fecha_arg
FROM movimientos_caja 
ORDER BY fecha DESC 
LIMIT 10;

-- 3. Verificar si hay fechas que parecen estar en UTC (hora 21:00)
SELECT 
    COUNT(*) as total_movimientos,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) = 21 THEN 1 END) as movimientos_21hs,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) = 0 THEN 1 END) as movimientos_00hs,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) BETWEEN 1 AND 23 THEN 1 END) as otros_horarios
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 4. Mostrar movimientos de hoy con detalles de zona horaria
SELECT 
    id,
    tipo,
    monto,
    concepto,
    fecha,
    -- Convertir a zona horaria local de Argentina
    fecha AT TIME ZONE 'America/Argentina/Buenos_Aires' as fecha_local_arg,
    -- Mostrar la hora en diferentes zonas
    EXTRACT(hour FROM fecha) as hora_original,
    EXTRACT(hour FROM fecha AT TIME ZONE 'America/Argentina/Buenos_Aires') as hora_arg,
    EXTRACT(hour FROM fecha AT TIME ZONE 'UTC') as hora_utc
FROM movimientos_caja 
WHERE fecha::date = CURRENT_DATE
ORDER BY fecha DESC;

-- 5. Función para corregir fechas si es necesario
-- NOTA: Solo ejecutar si se confirma que hay problemas de zona horaria
/*
CREATE OR REPLACE FUNCTION corregir_fechas_caja()
RETURNS void AS $$
BEGIN
    -- Actualizar fechas que parecen estar en UTC a hora local
    UPDATE movimientos_caja 
    SET fecha = fecha + INTERVAL '3 hours'  -- Ajuste para Argentina (UTC-3)
    WHERE EXTRACT(hour FROM fecha) = 21 
    AND fecha >= CURRENT_DATE - INTERVAL '7 days';
    
    RAISE NOTICE 'Fechas corregidas para movimientos de caja';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la corrección (descomentar si es necesario)
-- SELECT corregir_fechas_caja();
*/

-- 6. Verificar la configuración de zona horaria del servidor
SHOW timezone;
SELECT current_setting('timezone');

-- 7. Mostrar estadísticas de fechas por día
SELECT 
    fecha::date as dia,
    COUNT(*) as total_movimientos,
    COUNT(CASE WHEN tipo = 'ingreso' THEN 1 END) as ingresos,
    COUNT(CASE WHEN tipo = 'egreso' THEN 1 END) as egresos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
    SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) as total_egresos
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fecha::date
ORDER BY dia DESC;
