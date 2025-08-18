-- Script simplificado para cargar productos desde produc.txt
-- Ejecutar DESPUÉS de verificar-estructura-productos.sql

-- 1. Asegurar que las columnas necesarias existen
ALTER TABLE productos ADD COLUMN IF NOT EXISTS codigo_sku VARCHAR(100);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_mayorista DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;

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

-- 3. Insertar algunos productos de ejemplo (reemplazar con datos reales del archivo)
INSERT INTO productos_temp (codigo_sku, nombre, descripcion, categoria, precio, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo) VALUES
('1001', 'ACEITE 2T MOTUL 800', 'ACEITE 2T MOTUL 800', 'Lubricantes', 8500, 0, 5390, 3, 0, 'LITRO', true),
('1002', 'ACEITE 4T MOTUL 3000', 'ACEITE 4T MOTUL 3000', 'Lubricantes', 12000, 0, 7600, 5, 0, 'LITRO', true),
('1003', 'ACEITE 4T MOTUL 5100', 'ACEITE 4T MOTUL 5100', 'Lubricantes', 15000, 0, 9500, 2, 0, 'LITRO', true),
('1004', 'ACEITE 4T MOTUL 7100', 'ACEITE 4T MOTUL 7100', 'Lubricantes', 18000, 0, 11500, 1, 0, 'LITRO', true),
('1005', 'ACEITE 4T MOTUL 8100', 'ACEITE 4T MOTUL 8100', 'Lubricantes', 22000, 0, 14000, 1, 0, 'LITRO', true);

-- 4. Actualizar productos existentes (solo si tienen codigo_sku)
UPDATE productos 
SET 
  nombre = pt.nombre,
  descripcion = pt.descripcion,
  categoria = pt.categoria,
  precio = pt.precio,
  precio_mayorista = pt.precio_mayorista,
  costo = pt.costo,
  stock = pt.stock,
  stock_minimo = pt.stock_minimo,
  unidad_medida = pt.unidad_medida,
  activo = pt.activo,
  updated_at = NOW()
FROM productos_temp pt
WHERE productos.codigo_sku = pt.codigo_sku;

-- 5. Insertar productos nuevos
INSERT INTO productos (
  codigo_sku, nombre, descripcion, categoria, precio, precio_mayorista, 
  costo, stock, stock_minimo, unidad_medida, activo
)
SELECT 
  pt.codigo_sku, pt.nombre, pt.descripcion, pt.categoria, pt.precio, 
  pt.precio_mayorista, pt.costo, pt.stock, pt.stock_minimo, 
  pt.unidad_medida, pt.activo
FROM productos_temp pt
LEFT JOIN productos p ON p.codigo_sku = pt.codigo_sku
WHERE p.codigo_sku IS NULL;

-- 6. Verificar resultados
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  AVG(precio) as precio_promedio,
  COUNT(CASE WHEN precio_mayorista > 0 THEN 1 END) as productos_con_mayorista,
  COUNT(CASE WHEN costo > 0 THEN 1 END) as productos_con_costo
FROM productos;

-- 7. Mostrar productos cargados
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

-- 8. Limpiar tabla temporal
DROP TABLE productos_temp;
