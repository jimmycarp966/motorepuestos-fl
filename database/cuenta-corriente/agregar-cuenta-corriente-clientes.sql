-- Script para agregar columnas de cuenta corriente a la tabla de clientes
-- Ejecutar en el SQL Editor de Supabase

-- Agregar columnas de cuenta corriente
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS saldo_cuenta_corriente DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS limite_credito DECIMAL(10,2) DEFAULT 0;

-- Agregar comentarios para documentación
COMMENT ON COLUMN clientes.saldo_cuenta_corriente IS 'Saldo actual de la cuenta corriente del cliente (negativo = deuda)';
COMMENT ON COLUMN clientes.limite_credito IS 'Límite de crédito máximo permitido para el cliente';

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('saldo_cuenta_corriente', 'limite_credito')
ORDER BY column_name;
