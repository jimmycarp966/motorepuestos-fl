-- Script adaptativo para cargar productos
-- Se adapta a la estructura real de la tabla productos

-- 1. Verificar estructura actual
DO $$
DECLARE
    col_exists BOOLEAN;
    precio_col_name TEXT;
BEGIN
    -- Verificar si existe columna precio o precio_minorista
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio'
    ) INTO col_exists;
    
    IF col_exists THEN
        precio_col_name := 'precio';
    ELSE
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'productos' AND column_name = 'precio_minorista'
        ) INTO col_exists;
        
        IF col_exists THEN
            precio_col_name := 'precio_minorista';
        ELSE
            RAISE EXCEPTION 'No se encontró columna de precio (precio o precio_minorista)';
        END IF;
    END IF;
    
    RAISE NOTICE 'Usando columna de precio: %', precio_col_name;
END $$;

-- 2. Agregar columnas faltantes de forma segura
DO $$
BEGIN
    -- Agregar codigo_sku si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'codigo_sku'
    ) THEN
        ALTER TABLE productos ADD COLUMN codigo_sku VARCHAR(100);
        RAISE NOTICE 'Columna codigo_sku agregada';
    END IF;
    
    -- Agregar precio_mayorista si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio_mayorista'
    ) THEN
        ALTER TABLE productos ADD COLUMN precio_mayorista DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Columna precio_mayorista agregada';
    END IF;
    
    -- Agregar costo si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'costo'
    ) THEN
        ALTER TABLE productos ADD COLUMN costo DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Columna costo agregada';
    END IF;
    
    -- Agregar stock_minimo si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'stock_minimo'
    ) THEN
        ALTER TABLE productos ADD COLUMN stock_minimo INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna stock_minimo agregada';
    END IF;
END $$;

-- 3. Crear tabla temporal
CREATE TEMP TABLE productos_temp (
  codigo_sku VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  precio DECIMAL(10,2) DEFAULT 0,
  precio_mayorista DECIMAL(10,2) DEFAULT 0,
  costo DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  unidad_medida VARCHAR(50) DEFAULT 'UNIDAD',
  activo BOOLEAN DEFAULT true
);

-- 4. Insertar productos de ejemplo
INSERT INTO productos_temp (codigo_sku, nombre, descripcion, categoria, precio, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo) VALUES
('1001', 'ACEITE 2T MOTUL 800', 'ACEITE 2T MOTUL 800', 'Lubricantes', 8500, 0, 5390, 3, 0, 'LITRO', true),
('1002', 'ACEITE 4T MOTUL 3000', 'ACEITE 4T MOTUL 3000', 'Lubricantes', 12000, 0, 7600, 5, 0, 'LITRO', true),
('1003', 'ACEITE 4T MOTUL 5100', 'ACEITE 4T MOTUL 5100', 'Lubricantes', 15000, 0, 9500, 2, 0, 'LITRO', true);

-- 5. Actualizar productos existentes usando SQL dinámico
DO $$
DECLARE
    precio_col_name TEXT;
    update_sql TEXT;
BEGIN
    -- Determinar nombre de columna de precio
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio'
    ) THEN
        precio_col_name := 'precio';
    ELSE
        precio_col_name := 'precio_minorista';
    END IF;
    
    -- Construir SQL de actualización dinámicamente
    update_sql := format('
        UPDATE productos 
        SET 
          nombre = pt.nombre,
          descripcion = pt.descripcion,
          categoria = pt.categoria,
          %I = pt.precio,
          precio_mayorista = pt.precio_mayorista,
          costo = pt.costo,
          stock = pt.stock,
          stock_minimo = pt.stock_minimo,
          unidad_medida = pt.unidad_medida,
          activo = pt.activo,
          updated_at = NOW()
        FROM productos_temp pt
        WHERE productos.codigo_sku = pt.codigo_sku
    ', precio_col_name);
    
    EXECUTE update_sql;
    RAISE NOTICE 'Productos existentes actualizados usando columna: %', precio_col_name;
END $$;

-- 6. Insertar productos nuevos
INSERT INTO productos (
  codigo_sku, nombre, descripcion, categoria, 
  precio, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo
)
SELECT 
  pt.codigo_sku, pt.nombre, pt.descripcion, pt.categoria, 
  pt.precio, pt.precio_mayorista, pt.costo, pt.stock, pt.stock_minimo, 
  pt.unidad_medida, pt.activo
FROM productos_temp pt
LEFT JOIN productos p ON p.codigo_sku = pt.codigo_sku
WHERE p.codigo_sku IS NULL;

-- 7. Verificar resultados
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  AVG(precio) as precio_promedio,
  COUNT(CASE WHEN precio_mayorista > 0 THEN 1 END) as productos_con_mayorista,
  COUNT(CASE WHEN costo > 0 THEN 1 END) as productos_con_costo
FROM productos;

-- 8. Mostrar productos cargados
SELECT 
  codigo_sku,
  nombre,
  costo,
  precio as precio_minorista,
  precio_mayorista,
  stock,
  categoria
FROM productos 
WHERE codigo_sku IN (SELECT codigo_sku FROM productos_temp)
ORDER BY codigo_sku;

-- 9. Limpiar tabla temporal
DROP TABLE productos_temp;
