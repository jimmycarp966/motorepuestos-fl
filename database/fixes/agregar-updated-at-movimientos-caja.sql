-- Script para agregar columna updated_at a movimientos_caja
-- Ejecutar este script para resolver el error: Could not find the 'updated_at' column of 'movimientos_caja'

-- Agregar columna updated_at a movimientos_caja
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_movimientos_caja_updated_at ON movimientos_caja;

CREATE TRIGGER update_movimientos_caja_updated_at 
    BEFORE UPDATE ON movimientos_caja
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
    AND column_name = 'updated_at';

-- Comentarios:
-- Este script resuelve el error al eliminar movimientos de caja
-- La columna updated_at se actualizará automáticamente cuando se modifique un registro
-- El trigger utiliza la función update_updated_at_column() que ya existe en el sistema
