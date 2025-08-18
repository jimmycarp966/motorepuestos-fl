-- Script final para cargar productos desde produc.txt
-- Usa la estructura real de la tabla: precio_minorista, precio_mayorista, costo

-- 1. Crear tabla temporal
CREATE TEMP TABLE productos_temp (
  codigo_sku VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  precio_minorista DECIMAL(10,2) DEFAULT 0,
  precio_mayorista DECIMAL(10,2) DEFAULT 0,
  costo DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  unidad_medida VARCHAR(50) DEFAULT 'UNIDAD',
  activo BOOLEAN DEFAULT true
);

-- 2. Insertar productos de ejemplo
INSERT INTO productos_temp (codigo_sku, nombre, descripcion, categoria, precio_minorista, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo) VALUES
('1001', 'ACEITE 2T MOTUL 800', 'ACEITE 2T MOTUL 800', 'Lubricantes', 8500, 0, 5390, 3, 0, 'LITRO', true),
('1002', 'ACEITE 4T MOTUL 3000', 'ACEITE 4T MOTUL 3000', 'Lubricantes', 12000, 0, 7600, 5, 0, 'LITRO', true),
('1003', 'ACEITE 4T MOTUL 5100', 'ACEITE 4T MOTUL 5100', 'Lubricantes', 15000, 0, 9500, 2, 0, 'LITRO', true);

-- 3. Actualizar productos existentes
UPDATE productos 
SET 
  nombre = pt.nombre,
  descripcion = pt.descripcion,
  categoria = pt.categoria,
  precio_minorista = pt.precio_minorista,
  precio_mayorista = pt.precio_mayorista,
  costo = pt.costo,
  stock = pt.stock,
  stock_minimo = pt.stock_minimo,
  unidad_medida = pt.unidad_medida,
  activo = pt.activo,
  updated_at = NOW()
FROM productos_temp pt
WHERE productos.codigo_sku = pt.codigo_sku;

-- 4. Insertar productos nuevos
INSERT INTO productos (
  codigo_sku, nombre, descripcion, categoria, 
  precio_minorista, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo
)
SELECT 
  pt.codigo_sku, pt.nombre, pt.descripcion, pt.categoria, 
  pt.precio_minorista, pt.precio_mayorista, pt.costo, pt.stock, pt.stock_minimo, 
  pt.unidad_medida, pt.activo
FROM productos_temp pt
LEFT JOIN productos p ON p.codigo_sku = pt.codigo_sku
WHERE p.codigo_sku IS NULL;

-- 5. Verificar resultados
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  AVG(precio_minorista) as precio_promedio,
  COUNT(CASE WHEN precio_mayorista > 0 THEN 1 END) as productos_con_mayorista,
  COUNT(CASE WHEN costo > 0 THEN 1 END) as productos_con_costo
FROM productos;

-- 6. Mostrar productos cargados
SELECT 
  codigo_sku,
  nombre,
  costo,
  precio_minorista,
  precio_mayorista,
  stock,
  categoria
FROM productos 
WHERE codigo_sku IN (SELECT codigo_sku FROM productos_temp)
ORDER BY codigo_sku;

-- 7. Limpiar tabla temporal
DROP TABLE productos_temp;
