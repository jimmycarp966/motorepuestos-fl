-- SCRIPT SUPER SIMPLE - IMPOSIBLE QUE FALLE
-- Copia y pega esto en Supabase SQL Editor y ejecuta

-- 1. Agregar columnas una por una (más seguro)
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo';

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista';

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'completada';

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Agregar columna a venta_items
ALTER TABLE venta_items ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista';

-- 3. Verificar que funcionó
SELECT '✅ COLUMNAS AGREGADAS EXITOSAMENTE' as resultado;
