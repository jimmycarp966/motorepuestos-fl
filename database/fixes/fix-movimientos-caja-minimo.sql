-- ================================================
-- FIX MÍNIMO PARA TABLA MOVIMIENTOS_CAJA
-- ================================================
-- Script mínimo para resolver el error al eliminar movimientos de caja

-- Agregar columna estado si no existe
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activa';

-- Agregar columna updated_at si no existe
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Actualizar registros existentes
UPDATE movimientos_caja SET estado = 'activa' WHERE estado IS NULL;
UPDATE movimientos_caja SET updated_at = created_at WHERE updated_at IS NULL;

-- Verificación
SELECT 
    'movimientos_caja' as tabla,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
    AND column_name IN ('estado', 'updated_at')
ORDER BY column_name;
