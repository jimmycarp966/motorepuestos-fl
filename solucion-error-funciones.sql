-- Script para solucionar el error de funciones existentes
-- Ejecutar en el SQL Editor de Supabase ANTES de ejecutar setup-cuenta-corriente-robusto.sql

-- Eliminar funciones existentes que causan conflicto
DROP FUNCTION IF EXISTS validar_limite_credito(UUID, NUMERIC);
DROP FUNCTION IF EXISTS validar_limite_credito(UUID, DECIMAL);
DROP FUNCTION IF EXISTS validar_limite_credito(UUID, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS validar_limite_credito(UUID, DECIMAL, DECIMAL);

DROP FUNCTION IF EXISTS actualizar_saldo_cuenta_corriente(UUID, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS actualizar_saldo_cuenta_corriente(UUID, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS actualizar_saldo_cuenta_corriente(UUID, NUMERIC, VARCHAR);
DROP FUNCTION IF EXISTS actualizar_saldo_cuenta_corriente(UUID, DECIMAL, VARCHAR);

-- Verificar que las funciones fueron eliminadas
SELECT 
    'Funciones eliminadas' as estado,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('validar_limite_credito', 'actualizar_saldo_cuenta_corriente')
AND routine_schema = 'public';

-- Si no hay resultados, significa que las funciones fueron eliminadas correctamente
-- Ahora puedes ejecutar setup-cuenta-corriente-robusto.sql sin problemas
