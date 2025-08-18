-- Script inteligente para cargar productos
-- Detecta automáticamente las columnas existentes y se adapta

-- 1. Detectar columnas existentes y crear script dinámico
DO $$
DECLARE
    precio_col_name TEXT;
    costo_col_name TEXT;
    update_sql TEXT;
    insert_sql TEXT;
    col_list TEXT;
    val_list TEXT;
BEGIN
    -- Detectar columna de precio
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio'
    ) THEN
        precio_col_name := 'precio';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio_minorista'
    ) THEN
        precio_col_name := 'precio_minorista';
    ELSE
        precio_col_name := 'precio'; -- Usaremos este nombre para agregar la columna
    END IF;
    
    -- Detectar columna de costo
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'costo'
    ) THEN
        costo_col_name := 'costo';
    ELSE
        costo_col_name := 'costo'; -- Usaremos este nombre para agregar la columna
    END IF;
    
    RAISE NOTICE 'Columna de precio detectada: %', precio_col_name;
    RAISE NOTICE 'Columna de costo detectada: %', costo_col_name;
    
    -- Agregar columnas faltantes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = precio_col_name
    ) THEN
        EXECUTE format('ALTER TABLE productos ADD COLUMN %I DECIMAL(10,2) DEFAULT 0', precio_col_name);
        RAISE NOTICE 'Columna % agregada', precio_col_name;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = costo_col_name
    ) THEN
        EXECUTE format('ALTER TABLE productos ADD COLUMN %I DECIMAL(10,2) DEFAULT 0', costo_col_name);
        RAISE NOTICE 'Columna % agregada', costo_col_name;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio_mayorista'
    ) THEN
        ALTER TABLE productos ADD COLUMN precio_mayorista DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Columna precio_mayorista agregada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'stock_minimo'
    ) THEN
        ALTER TABLE productos ADD COLUMN stock_minimo INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna stock_minimo agregada';
    END IF;
    
END $$;

-- 2. Crear tabla temporal
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

-- 3. Insertar productos de ejemplo
INSERT INTO productos_temp (codigo_sku, nombre, descripcion, categoria, precio, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo) VALUES
('1001', 'ACEITE 2T MOTUL 800', 'ACEITE 2T MOTUL 800', 'Lubricantes', 8500, 0, 5390, 3, 0, 'LITRO', true),
('1002', 'ACEITE 4T MOTUL 3000', 'ACEITE 4T MOTUL 3000', 'Lubricantes', 12000, 0, 7600, 5, 0, 'LITRO', true),
('1003', 'ACEITE 4T MOTUL 5100', 'ACEITE 4T MOTUL 5100', 'Lubricantes', 15000, 0, 9500, 2, 0, 'LITRO', true);

-- 4. Actualizar productos existentes usando SQL dinámico
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

-- 5. Insertar productos nuevos usando SQL dinámico
DO $$
DECLARE
    precio_col_name TEXT;
    insert_sql TEXT;
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
    
    -- Construir SQL de inserción dinámicamente
    insert_sql := format('
        INSERT INTO productos (
          codigo_sku, nombre, descripcion, categoria, 
          %I, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo
        )
        SELECT 
          pt.codigo_sku, pt.nombre, pt.descripcion, pt.categoria, 
          pt.precio, pt.precio_mayorista, pt.costo, pt.stock, pt.stock_minimo, 
          pt.unidad_medida, pt.activo
        FROM productos_temp pt
        LEFT JOIN productos p ON p.codigo_sku = pt.codigo_sku
        WHERE p.codigo_sku IS NULL
    ', precio_col_name);
    
    EXECUTE insert_sql;
    RAISE NOTICE 'Productos nuevos insertados usando columna: %', precio_col_name;
END $$;

-- 6. Verificar resultados
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  COUNT(CASE WHEN precio_mayorista > 0 THEN 1 END) as productos_con_mayorista,
  COUNT(CASE WHEN costo > 0 THEN 1 END) as productos_con_costo
FROM productos;

-- 7. Mostrar productos cargados
SELECT 
  codigo_sku,
  nombre,
  costo,
  precio_mayorista,
  stock,
  categoria
FROM productos 
WHERE codigo_sku IN (SELECT codigo_sku FROM productos_temp)
ORDER BY codigo_sku;

-- 8. Limpiar tabla temporal
DROP TABLE productos_temp;
