-- Script para verificar y corregir la estructura de la tabla productos
-- Ejecutar ANTES del script de carga de productos

-- 1. Verificar columnas existentes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 2. Agregar columnas faltantes si no existen
ALTER TABLE productos ADD COLUMN IF NOT EXISTS codigo_sku VARCHAR(100);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_mayorista DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;

-- 3. Verificar que la columna precio existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio'
    ) THEN
        RAISE EXCEPTION 'La columna "precio" no existe en la tabla productos. Verificar estructura.';
    END IF;
END $$;

-- 4. Crear índices necesarios
CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_codigo_sku ON productos(codigo_sku);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- 5. Verificar estructura final
SELECT 
    'Estructura de tabla productos:' as info,
    COUNT(*) as total_columnas
FROM information_schema.columns 
WHERE table_name = 'productos';

-- 6. Mostrar columnas finales
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;
