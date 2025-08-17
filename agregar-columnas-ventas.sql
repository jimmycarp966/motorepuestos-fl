-- Script directo para agregar columnas faltantes a ventas
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas a la tabla ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo',
ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista',
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'completada',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Agregar columna a venta_items
ALTER TABLE venta_items 
ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista';

-- Verificar que se agregaron
SELECT 
    'VENTAS - COLUMNAS AGREGADAS' as info,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
    AND column_name IN ('metodo_pago', 'tipo_precio', 'estado', 'updated_at')
ORDER BY column_name;

SELECT 
    'VENTA_ITEMS - COLUMNA AGREGADA' as info,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venta_items' 
    AND column_name = 'tipo_precio';
