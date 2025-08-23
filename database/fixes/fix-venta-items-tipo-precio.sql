-- ================================================
-- FIX: Agregar columna tipo_precio a venta_items
-- ================================================
-- Este script agrega la columna tipo_precio a la tabla venta_items
-- si no existe, para mantener consistencia con el código TypeScript

-- Verificar si la columna tipo_precio existe en venta_items
DO $$
BEGIN
    -- Agregar columna tipo_precio si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venta_items' 
        AND column_name = 'tipo_precio'
    ) THEN
        ALTER TABLE venta_items 
        ADD COLUMN tipo_precio VARCHAR(20) DEFAULT 'minorista' CHECK (tipo_precio IN ('minorista', 'mayorista'));
        
        RAISE NOTICE 'Columna tipo_precio agregada a venta_items';
    ELSE
        RAISE NOTICE 'Columna tipo_precio ya existe en venta_items';
    END IF;
END $$;

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'venta_items' 
AND column_name = 'tipo_precio';
