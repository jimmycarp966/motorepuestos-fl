-- Script para corregir fechas de movimientos de caja
-- Este script corrige problemas de zona horaria en fechas existentes

-- 1. Verificar el estado actual antes de la corrección
SELECT 
    'ESTADO ACTUAL' as estado,
    COUNT(*) as total_movimientos,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) = 21 THEN 1 END) as movimientos_21hs,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) = 0 THEN 1 END) as movimientos_00hs,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) BETWEEN 1 AND 20 THEN 1 END) as otros_horarios
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 2. Mostrar algunos ejemplos de fechas problemáticas
SELECT 
    id,
    tipo,
    monto,
    concepto,
    fecha,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_actual,
    to_char(fecha + INTERVAL '3 hours', 'YYYY-MM-DD HH24:MI:SS') as fecha_corregida
FROM movimientos_caja 
WHERE EXTRACT(hour FROM fecha) = 21 
AND fecha >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY fecha DESC
LIMIT 5;

-- 3. Corregir fechas que están en UTC (hora 21:00) a hora local de Argentina
-- Esto convierte las 21:00 UTC a 00:00 del día siguiente en Argentina
UPDATE movimientos_caja 
SET fecha = fecha + INTERVAL '3 hours'
WHERE EXTRACT(hour FROM fecha) = 21 
AND fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 4. Verificar el estado después de la corrección
SELECT 
    'DESPUÉS DE CORRECCIÓN' as estado,
    COUNT(*) as total_movimientos,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) = 0 THEN 1 END) as movimientos_00hs,
    COUNT(CASE WHEN EXTRACT(hour FROM fecha) BETWEEN 1 AND 23 THEN 1 END) as otros_horarios
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days';

-- 5. Mostrar ejemplos de fechas corregidas
SELECT 
    id,
    tipo,
    monto,
    concepto,
    to_char(fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha_corregida,
    EXTRACT(hour FROM fecha) as hora
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY fecha DESC
LIMIT 10;

-- 6. Verificar que no haya fechas futuras (que podrían indicar errores)
SELECT 
    COUNT(*) as fechas_futuras
FROM movimientos_caja 
WHERE fecha > NOW() + INTERVAL '1 hour';

-- 7. Mostrar estadísticas finales
SELECT 
    fecha::date as dia,
    COUNT(*) as total_movimientos,
    MIN(EXTRACT(hour FROM fecha)) as hora_minima,
    MAX(EXTRACT(hour FROM fecha)) as hora_maxima,
    AVG(EXTRACT(hour FROM fecha)) as hora_promedio
FROM movimientos_caja 
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha::date
ORDER BY dia DESC;

-- 8. Crear un índice para mejorar el rendimiento de consultas por fecha
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_fecha_corregida 
ON movimientos_caja(fecha);

-- 9. Verificar que el índice se creó correctamente
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'movimientos_caja' 
AND indexname = 'idx_movimientos_caja_fecha_corregida';

-- 10. Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Corrección de fechas completada';
    RAISE NOTICE '📅 Las fechas de movimientos de caja han sido ajustadas a la zona horaria local';
    RAISE NOTICE '🕐 Las horas ahora deberían mostrar correctamente en lugar de las 21:00';
END $$;
