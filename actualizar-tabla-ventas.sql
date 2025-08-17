-- Script para actualizar la tabla ventas con columnas faltantes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual de la tabla ventas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventas'
ORDER BY ordinal_position;

-- 2. Agregar columnas faltantes si no existen
DO $$ 
BEGIN
    -- Agregar metodo_pago si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'metodo_pago'
    ) THEN
        ALTER TABLE ventas ADD COLUMN metodo_pago VARCHAR(50) DEFAULT 'efectivo';
        RAISE NOTICE 'Columna metodo_pago agregada a la tabla ventas';
    ELSE
        RAISE NOTICE 'Columna metodo_pago ya existe en la tabla ventas';
    END IF;

    -- Agregar tipo_precio si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'tipo_precio'
    ) THEN
        ALTER TABLE ventas ADD COLUMN tipo_precio VARCHAR(20) DEFAULT 'minorista';
        RAISE NOTICE 'Columna tipo_precio agregada a la tabla ventas';
    ELSE
        RAISE NOTICE 'Columna tipo_precio ya existe en la tabla ventas';
    END IF;

    -- Agregar estado si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'estado'
    ) THEN
        ALTER TABLE ventas ADD COLUMN estado VARCHAR(50) DEFAULT 'completada';
        RAISE NOTICE 'Columna estado agregada a la tabla ventas';
    ELSE
        RAISE NOTICE 'Columna estado ya existe en la tabla ventas';
    END IF;

    -- Agregar updated_at si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE ventas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna updated_at agregada a la tabla ventas';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe en la tabla ventas';
    END IF;
END $$;

-- 3. Verificar estructura actualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ventas'
ORDER BY ordinal_position;

-- 4. Verificar si la tabla venta_items tiene tipo_precio
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venta_items'
ORDER BY ordinal_position;

-- 5. Agregar tipo_precio a venta_items si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venta_items' AND column_name = 'tipo_precio'
    ) THEN
        ALTER TABLE venta_items ADD COLUMN tipo_precio VARCHAR(20) DEFAULT 'minorista';
        RAISE NOTICE 'Columna tipo_precio agregada a la tabla venta_items';
    ELSE
        RAISE NOTICE 'Columna tipo_precio ya existe en la tabla venta_items';
    END IF;
END $$;

-- 6. Verificar datos existentes
SELECT 
    'ventas' as tabla,
    COUNT(*) as registros
FROM ventas
UNION ALL
SELECT 
    'venta_items' as tabla,
    COUNT(*) as registros
FROM venta_items;

-- 7. Mostrar estructura final
SELECT 
    'ventas' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventas'
UNION ALL
SELECT 
    'venta_items' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'venta_items'
ORDER BY tabla, column_name;
