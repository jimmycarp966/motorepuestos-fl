-- Script para agregar las columnas faltantes
-- Ejecutar después de verificar la estructura actual

-- 1. Agregar columnas faltantes a la tabla ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo',
ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista',
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'completada',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Agregar columnas faltantes a la tabla venta_items
ALTER TABLE venta_items 
ADD COLUMN IF NOT EXISTS tipo_precio VARCHAR(20) DEFAULT 'minorista';

-- 3. Verificar que se agregaron correctamente
SELECT 
    'VERIFICACION COLUMNAS AGREGADAS' as tipo,
    'ventas.metodo_pago' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'metodo_pago'
    ) as existe
UNION ALL
SELECT 
    'VERIFICACION COLUMNAS AGREGADAS' as tipo,
    'ventas.tipo_precio' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'tipo_precio'
    ) as existe
UNION ALL
SELECT 
    'VERIFICACION COLUMNAS AGREGADAS' as tipo,
    'ventas.estado' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'estado'
    ) as existe
UNION ALL
SELECT 
    'VERIFICACION COLUMNAS AGREGADAS' as tipo,
    'ventas.updated_at' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'updated_at'
    ) as existe
UNION ALL
SELECT 
    'VERIFICACION COLUMNAS AGREGADAS' as tipo,
    'venta_items.tipo_precio' as columna,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venta_items' AND column_name = 'tipo_precio'
    ) as existe;

-- 4. Mostrar estructura final de ventas
SELECT 
    'ESTRUCTURA FINAL VENTAS' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;
