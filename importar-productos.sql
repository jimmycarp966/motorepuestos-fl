-- Script para importar productos desde products_rows.sql a la tabla productos
-- Ejecutar en Supabase SQL Editor

-- Primero, limpiar la tabla productos existente (opcional)
-- DELETE FROM productos;

-- Insertar productos desde el archivo products_rows.sql
-- Nota: Los campos se mapean de la siguiente manera:
-- code -> codigo_sku
-- name -> nombre
-- description -> descripcion
-- retail_price -> precio_minorista
-- wholesale_price -> precio_mayorista
-- cost -> costo
-- stock -> stock
-- min_stock -> stock_minimo
-- category -> categoria
-- active -> activo

INSERT INTO productos (
  codigo_sku,
  nombre,
  descripcion,
  precio_minorista,
  precio_mayorista,
  costo,
  stock,
  stock_minimo,
  categoria,
  activo,
  created_at,
  updated_at
) VALUES 
('1003411', 'CILINDRO SMASH BIT 52,4MM HIERRO C/PISTON Y JUNTA FORTE', 'CILINDRO SMASH BIT 52,4MM HIERRO C/PISTON Y JUNTA FORTE', 43200.00, 43200.00, 26950.00, 1, 0, 'Motor', true, NOW(), NOW()),
('HBU001', 'BUJIA C7HS CHOHO SMASH CRYPTON YBR 125', 'BUJIA C7HS CHOHO SMASH CRYPTON YBR 125', 2350.00, 2350.00, 1460.00, 0, 1, 'Encendido', true, NOW(), NOW()),
('1634', 'BATERIA 12N5-3B YUASA', 'BATERIA 12N5-3B YUASA', 52900.00, 52900.00, 33010.00, 2, 0, 'Eléctrico', true, NOW(), NOW()),
('1807', 'LATITA GEL', 'LATITA GEL', 6500.00, 6500.00, 3300.00, 10, 0, 'Accesorios', true, NOW(), NOW()),
('1653', 'FUNDA HONDA STORM', 'FUNDA HONDA STORM', 11000.00, 11000.00, 7280.00, 0, 0, 'Accesorios', true, NOW(), NOW()),
('ZV142', 'TAPON DE ACEITE SMASH CROMADO', 'TAPON DE ACEITE SMASH CROMADO', 1500.00, 1500.00, 610.00, 9, 0, 'Motor', true, NOW(), NOW()),
('1210', 'CADENA 428x110L RAION', 'CADENA 428x110L RAION', 9000.00, 9000.00, 4980.00, 30, 0, 'Transmisión', true, NOW(), NOW()),
('1455', 'CUBRE CADENA RX 150', 'CUBRE CADENA RX 150', 5700.00, 5700.00, 3520.00, 0, 0, 'Transmisión', true, NOW(), NOW()),
('1622', 'ESCAPE PAOLUCCI RX150', 'ESCAPE PAOLUCCI RX150', 167000.00, 167000.00, 104390.00, 0, 0, 'Escape', true, NOW(), NOW()),
('1870', 'LED POSICION DE COLORES CON CONTROL', 'LED POSICION DE COLORES CON CONTROL', 7500.00, 7500.00, 4650.00, 4, 0, 'Iluminación', true, NOW(), NOW()),
('1006559', 'LLAVE CONTACTO NEW TITAN 150', 'LLAVE CONTACTO NEW TITAN 150', 19000.00, 19000.00, 11600.00, 2, 0, 'Eléctrico', true, NOW(), NOW()),
('14', 'VALVULA SMASH 110 OSAKA', 'VALVULA SMASH 110 OSAKA', 3500.00, 3500.00, 1660.00, 4, 1, 'Motor', true, NOW(), NOW()),
('1002838', 'DESTELLADOR 12V 2 PATAS YAKAWA', 'DESTELLADOR 12V 2 PATAS YAKAWA', 3500.00, 3500.00, 2125.00, 9, 0, 'Eléctrico', true, NOW(), NOW()),
('1392', 'VALVULA NEW WAVE 110', 'VALVULA NEW WAVE 110', 4200.00, 4200.00, 1920.00, 3, 0, 'Motor', true, NOW(), NOW()),
('1502', 'BUJE DE MAZA CON TORNILLO Y TUERCA MAX5', 'BUJE DE MAZA CON TORNILLO Y TUERCA MAX5', 5500.00, 5500.00, 3300.00, 1, 0, 'Suspensión', true, NOW(), NOW()),
('1441', 'COMANDO ELEC IZQUIERDO TITAN 150 Wave', 'COMANDO ELEC IZQUIERDO TITAN 150 Wave', 17300.00, 17300.00, 10800.00, 0, 0, 'Eléctrico', true, NOW(), NOW()),
('1005029', 'ESPEJO SMASH FORTE', 'ESPEJO SMASH FORTE', 9500.00, 9500.00, 4020.00, 2, 0, 'Accesorios', true, NOW(), NOW()),
('1006464', 'RULEMAN VETOR 6304 2RS', 'RULEMAN VETOR 6304 2RS', 4200.00, 4200.00, 2360.00, 12, 1, 'Motor', true, NOW(), NOW()),
('1802', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 5000.00, 5000.00, 2900.00, 6, 0, 'Accesorios', true, NOW(), NOW()),
('75', 'RETEN DE VALVULA 5MM FORTE', 'RETEN DE VALVULA 5MM FORTE', 350.00, 350.00, 200.00, 11, 5, 'Motor', true, NOW(), NOW());

-- Verificar que los productos se insertaron correctamente
SELECT 
  codigo_sku,
  nombre,
  precio_minorista,
  precio_mayorista,
  stock,
  activo
FROM productos
ORDER BY nombre
LIMIT 20;

-- Mostrar estadísticas de la importación
SELECT 
  COUNT(*) as total_productos,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as productos_con_stock,
  COUNT(CASE WHEN stock = 0 THEN 1 END) as productos_sin_stock,
  COUNT(CASE WHEN stock <= stock_minimo THEN 1 END) as productos_stock_critico,
  SUM(stock) as stock_total,
  AVG(precio_minorista) as precio_promedio_minorista,
  AVG(precio_mayorista) as precio_promedio_mayorista
FROM productos;
