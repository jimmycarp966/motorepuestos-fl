-- ================================================
-- FIX SIMPLE PARA TABLA MOVIMIENTOS_CAJA
-- ================================================
-- Script para resolver errores al eliminar movimientos de caja
-- Agrega las columnas estado y updated_at que faltan

-- Agregar columna estado si no existe
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activa';

-- Agregar columna updated_at si no existe
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear o reemplazar la función update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_movimientos_caja_updated_at ON movimientos_caja;

CREATE TRIGGER update_movimientos_caja_updated_at 
    BEFORE UPDATE ON movimientos_caja
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_estado ON movimientos_caja(estado);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_updated_at ON movimientos_caja(updated_at);

-- Actualizar registros existentes para que tengan estado 'activa'
UPDATE movimientos_caja SET estado = 'activa' WHERE estado IS NULL;

-- Actualizar registros existentes para que tengan updated_at
UPDATE movimientos_caja SET updated_at = created_at WHERE updated_at IS NULL;

-- Verificación final
SELECT 
    'movimientos_caja' as tabla,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
    AND column_name IN ('estado', 'updated_at')
ORDER BY column_name;

-- Verificar trigger
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'movimientos_caja'
    AND trigger_name = 'update_movimientos_caja_updated_at';

-- Resumen
SELECT 
    'RESUMEN' as verificacion,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos_caja' AND column_name = 'estado')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movimientos_caja' AND column_name = 'updated_at')
        THEN '✅ TABLA MOVIMIENTOS_CAJA REPARADA EXITOSAMENTE'
        ELSE '❌ ERROR EN LA REPARACIÓN'
    END as resultado;
