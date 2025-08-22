-- ================================================
-- FIX COMPLETO PARA TABLA MOVIMIENTOS_CAJA
-- ================================================
-- Script para resolver errores al eliminar movimientos de caja
-- Agrega las columnas estado y updated_at que faltan

-- ================================
-- VERIFICAR Y REPARAR TABLA MOVIMIENTOS_CAJA
-- ================================

DO $$
DECLARE
  columna_estado_existe BOOLEAN;
  columna_updated_at_existe BOOLEAN;
BEGIN
  -- Verificar si la columna estado existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'estado'
  ) INTO columna_estado_existe;
  
  -- Verificar si la columna updated_at existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'updated_at'
  ) INTO columna_updated_at_existe;
  
  -- Agregar columna estado si no existe
  IF NOT columna_estado_existe THEN
    RAISE NOTICE '❌ Columna estado NO existe en movimientos_caja - agregando...';
    ALTER TABLE movimientos_caja ADD COLUMN estado VARCHAR(20) DEFAULT 'activa';
    RAISE NOTICE '✅ Columna estado agregada a movimientos_caja';
  ELSE
    RAISE NOTICE '✅ Columna estado ya existe en movimientos_caja';
  END IF;
  
  -- Agregar columna updated_at si no existe
  IF NOT columna_updated_at_existe THEN
    RAISE NOTICE '❌ Columna updated_at NO existe en movimientos_caja - agregando...';
    ALTER TABLE movimientos_caja ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Columna updated_at agregada a movimientos_caja';
  ELSE
    RAISE NOTICE '✅ Columna updated_at ya existe en movimientos_caja';
  END IF;
  
END $$;

-- ================================
-- CREAR TRIGGER PARA UPDATED_AT
-- ================================

-- Verificar si la función update_updated_at_column existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    RAISE NOTICE '❌ Función update_updated_at_column NO existe - creando...';
  ELSE
    RAISE NOTICE '✅ Función update_updated_at_column ya existe';
  END IF;
END $$;

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

-- ================================
-- CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ================================

CREATE INDEX IF NOT EXISTS idx_movimientos_caja_estado ON movimientos_caja(estado);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_updated_at ON movimientos_caja(updated_at);

-- ================================
-- ACTUALIZAR REGISTROS EXISTENTES
-- ================================

-- Actualizar registros existentes para que tengan estado 'activa'
UPDATE movimientos_caja SET estado = 'activa' WHERE estado IS NULL;

-- Actualizar registros existentes para que tengan updated_at
UPDATE movimientos_caja SET updated_at = created_at WHERE updated_at IS NULL;

-- ================================
-- VERIFICACIÓN FINAL
-- ================================

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

-- Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'movimientos_caja'
    AND trigger_name = 'update_movimientos_caja_updated_at';

-- Comentarios:
-- Este script resuelve completamente el error al eliminar movimientos de caja
-- Agrega las columnas estado y updated_at que faltan
-- Crea el trigger necesario para actualizar updated_at automáticamente
-- Crea índices para mejorar el rendimiento
-- Actualiza registros existentes con valores por defecto
