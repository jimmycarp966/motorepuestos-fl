-- Script para cargar productos desde produc.txt
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar y agregar columnas necesarias si no existen
ALTER TABLE productos ADD COLUMN IF NOT EXISTS codigo_sku VARCHAR(100);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_mayorista DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;

-- 2. Limpiar tabla de productos existente (opcional - comentar si no se desea)
-- TRUNCATE TABLE productos RESTART IDENTITY CASCADE;

-- 3. Insertar productos desde produc.txt
-- Los datos se procesan manualmente desde el archivo produc.txt

INSERT INTO productos (
  codigo_sku,
  nombre,
  descripcion,
  categoria,
  precio,
  precio_mayorista,
  costo,
  stock,
  stock_minimo,
  unidad_medida,
  activo
) VALUES 
-- FOCO 110
('FOCO 110', 'FOCO 110', 'Foco de 110V', 'Iluminación', 1900.00, 0.00, 0.00, 20, 0, 'pcs', true),

-- ABRAZADERA 110
('1728', 'ABRAZADERA 110', 'Abrazadera para mangueras 110mm', 'Accesorios', 3800.00, 0.00, 2150.00, 4, 0, 'pcs', true),

-- ABRAZADERA MANGUERA DE NAFTA
('1420', 'ABRAZADERA MANGUERA DE NAFTA', 'Abrazadera para manguera de nafta', 'Accesorios', 200.00, 0.00, 74.00, 100, 0, 'pcs', true),

-- ACEITE 2T 100CC COMPETICION RECCINO
('1226', 'ACEITE 2T 100CC COMPETICION RECCINO', 'Aceite 2 tiempos para competencia', 'Lubricantes', 4320.00, 0.00, 1520.00, 1, 2, 'lt', true),

-- ACEITE 2T CASTROL 1L
('1772', 'ACEITE 2T CASTROL 1L', 'Aceite 2 tiempos Castrol 1 litro', 'Lubricantes', 11000.00, 0.00, 6630.00, 2, 0, 'lt', true),

-- ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER
('54', 'ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', 'Aceite 2 tiempos 100cc', 'Lubricantes', 2000.00, 0.00, 1190.00, 27, 0, 'lt', true),

-- ACEITE CASTROL BLANCO
('1343', 'ACEITE CASTROL BLANCO', 'Aceite Castrol blanco', 'Lubricantes', 9500.00, 0.00, 5850.00, 7, 0, 'lt', true),

-- ACEITE CASTROL GRIS
('1272', 'ACEITE CASTROL GRIS', 'Aceite Castrol gris', 'Lubricantes', 11000.00, 0.00, 7000.00, 21, 0, 'lt', true),

-- ACEITE CASTROL SEMI-SINTETICO POWER1
('1534', 'ACEITE CASTROL SEMI-SINTETICO POWER1', 'Aceite semi-sintético Castrol Power1', 'Lubricantes', 14000.00, 0.00, 9980.00, 2, 0, 'lt', true),

-- ACEITE DE CADENA WALKER
('1603', 'ACEITE DE CADENA WALKER', 'Aceite para cadena Walker', 'Lubricantes', 4200.00, 0.00, 2620.00, 0, 0, 'lt', true),

-- ACEITE DE CADENA X 240 CM AEROTEK
('51', 'ACEITE DE CADENA X 240 CM AEROTEK', 'Aceite para cadena Aerotek 240cm', 'Lubricantes', 2800.00, 0.00, 800.00, 2, 5, 'lt', true),

-- ACEITE DE SUSPENSION 10W X 250CC MACH
('1686', 'ACEITE DE SUSPENSION 10W X 250CC MACH', 'Aceite de suspensión 10W 250cc', 'Lubricantes', 3900.00, 0.00, 2470.00, 8, 0, 'lt', true),

-- ACEITE DE SUSPENSION 15W FERCOL
('1507', 'ACEITE DE SUSPENSION 15W FERCOL', 'Aceite de suspensión 15W Fercol', 'Lubricantes', 4500.00, 0.00, 2650.00, 1, 0, 'lt', true),

-- ACEITE DE SUSPENSION FORCES X 200CM WANDER
('52', 'ACEITE DE SUSPENSION FORCES X 200CM WANDER', 'Aceite de suspensión Forces 200cm', 'Lubricantes', 3200.00, 0.00, 1980.00, 0, 0, 'lt', true),

-- ACEITE HONDA HGO 10W30
('1725', 'ACEITE HONDA HGO 10W30', 'Aceite Honda HGO 10W30', 'Lubricantes', 14500.00, 0.00, 9500.00, 14, 0, 'lt', true),

-- ACEITE IPONE 20W50 SEMI SINTETICO
('1794', 'ACEITE IPONE 20W50 SEMI SINTETICO', 'Aceite Ipone 20W50 semi-sintético', 'Lubricantes', 17000.00, 0.00, 11900.00, 12, 0, 'lt', true),

-- ACEITE MOTUL 3000 20W50 MINERAL
('1770', 'ACEITE MOTUL 3000 20W50 MINERAL', 'Aceite Motul 3000 20W50 mineral', 'Lubricantes', 14000.00, 0.00, 8750.00, 10, 0, 'lt', true),

-- ACEITE MOTUL 5000 20W50 SEMISINTETICO
('1535', 'ACEITE MOTUL 5000 20W50 SEMISINTETICO', 'Aceite Motul 5000 20W50 semi-sintético', 'Lubricantes', 14500.00, 0.00, 9000.00, 21, 0, 'lt', true),

-- ACEITE MOTUL 5100 SEMISINTETICO
('1450', 'ACEITE MOTUL 5100 SEMISINTETICO', 'Aceite Motul 5100 semi-sintético', 'Lubricantes', 16000.00, 0.00, 9920.00, 3, 0, 'lt', true),

-- ACEITE MOTUL 7100
('1633', 'ACEITE MOTUL 7100', 'Aceite Motul 7100', 'Lubricantes', 31000.00, 0.00, 21880.00, 7, 0, 'lt', true),

-- ACEITE RIDERS 4T
('1282', 'ACEITE RIDERS 4T', 'Aceite Riders 4 tiempos', 'Lubricantes', 4000.00, 0.00, 3080.00, 119, 0, 'lt', true),

-- ACEITE ROD YPF 20 W 50
('53', 'ACEITE ROD YPF 20 W 50', 'Aceite ROD YPF 20W50', 'Lubricantes', 6500.00, 0.00, 4500.00, 239, 0, 'lt', true),

-- ACEITE SHELL ADVACE AX3 ROJO
('551', 'ACEITE SHELL ADVACE AX3 ROJO', 'Aceite Shell Advance AX3 rojo', 'Lubricantes', 8500.00, 0.00, 5700.00, 0, 0, 'lt', true),

-- ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO
('550', 'ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', 'Aceite Shell Advance 20W50 AX5 amarillo', 'Lubricantes', 9800.00, 0.00, 6600.00, 0, 1, 'lt', true),

-- ACEITE WANDER 15W50 SEMI SINTETICO
('1371', 'ACEITE WANDER 15W50 SEMI SINTETICO', 'Aceite Wander 15W50 semi-sintético', 'Lubricantes', 7000.00, 0.00, 4300.00, 1, 0, 'lt', true),

-- ACEITE WANDER MINERAL
('W0065', 'ACEITE WANDER MINERAL', 'Aceite Wander mineral', 'Lubricantes', 6000.00, 0.00, 3780.00, 3, 0, 'lt', true),

-- ACEITE YAMALUBE 20W40
('1536', 'ACEITE YAMALUBE 20W40', 'Aceite Yamalube 20W40', 'Lubricantes', 14000.00, 0.00, 8740.00, 4, 0, 'lt', true),

-- ACELERADOR RAPIDO ANONIZADOS
('1889', 'ACELERADOR RAPIDO ANONIZADOS', 'Acelerador rápido anodizado', 'Accesorios', 24000.00, 0.00, 12000.00, 5, 0, 'pcs', true),

-- ACELERADOR RAPIDO UNIVERSAL
('1430', 'ACELERADOR RAPIDO UNIVERSAL', 'Acelerador rápido universal', 'Accesorios', 7000.00, 0.00, 3925.00, 3, 0, 'pcs', true),

-- ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA
('153', 'ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA', 'Acelerador rápido universal aluminio', 'Accesorios', 7900.00, 0.00, 4890.00, 0, 0, 'pcs', true),

-- ACELERADOR SMASH/BIZ/TRIP 110
('6425', 'ACELERADOR SMASH/BIZ/TRIP 110', 'Acelerador para Smash/Biz/Trip 110', 'Accesorios', 4700.00, 0.00, 2890.00, 0, 0, 'pcs', true),

-- ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT
('1802', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 'Acondicionador de superficie', 'Limpieza', 5000.00, 0.00, 2900.00, 6, 0, 'pcs', true),

-- ACOPLE CARBURADOR DE FILTRO DAKAR200
('SM036', 'ACOPLE CARBURADOR DE FILTRO DAKAR200', 'Acople de carburador para filtro Dakar200', 'Carburación', 3400.00, 0.00, 2100.00, 3, 0, 'pcs', true),

-- ACOPLE DE CARBURADOR TITAN150
('SAM0368', 'ACOPLE DE CARBURADOR TITAN150', 'Acople de carburador Titan150', 'Carburación', 4800.00, 0.00, 2990.00, 2, 0, 'pcs', true),

-- ACOPLE FILTRO RX150
('SM0365', 'ACOPLE FILTRO RX150', 'Acople de filtro RX150', 'Carburación', 2200.00, 0.00, 1350.00, 2, 0, 'pcs', true),

-- ACRILICO FAROL DELANTERO H WAVE
('526', 'ACRILICO FAROL DELANTERO H WAVE', 'Acrílico farol delantero Honda Wave', 'Iluminación', 4000.00, 0.00, 2080.00, 1, 0, 'pcs', true),

-- ACRILICO FAROL GIRO WAVE IZQUIERDO
('546', 'ACRILICO FAROL GIRO WAVE IZQUIERDO', 'Acrílico farol giro Wave izquierdo', 'Iluminación', 4000.00, 0.00, 2450.00, 4, 0, 'pcs', true),

-- ACRILICO FAROL TRAS DERECHO SMASH
('435', 'ACRILICO FAROL TRAS DERECHO SMASH', 'Acrílico farol trasero derecho Smash', 'Iluminación', 3000.00, 0.00, 1500.00, 1, 0, 'pcs', true),

-- ACRILICO FAROL TRAS IZQUIERDO SMASH
('436', 'ACRILICO FAROL TRAS IZQUIERDO SMASH', 'Acrílico farol trasero izquierdo Smash', 'Iluminación', 3000.00, 0.00, 1500.00, 0, 0, 'pcs', true),

-- ACRILICO FAROL TRASERO BIZ/ MOTOMEL ZANELA ROJO
('433', 'ACRILICO FAROL TRASERO BIZ/ MOTOMEL ZANELA ROJO', 'Acrílico farol trasero Biz/Motomel Zanella rojo', 'Iluminación', 5900.00, 0.00, 3640.00, 5, 0, 'pcs', true),

-- ACRILICO FAROL TRASERO CRISTAL SMASH Y OTRAS
('434', 'ACRILICO FAROL TRASERO CRISTAL SMASH Y OTRAS', 'Acrílico farol trasero cristal Smash', 'Iluminación', 5900.00, 0.00, 3640.00, 3, 0, 'pcs', true),

-- ACRILICO FAROL TRASERO ROJO WAVE
('496', 'ACRILICO FAROL TRASERO ROJO WAVE', 'Acrílico farol trasero rojo Wave', 'Iluminación', 4500.00, 0.00, 2630.00, 4, 1, 'pcs', true),

-- ACRILICO GIRO DERECHO WAVE
('547', 'ACRILICO GIRO DERECHO WAVE', 'Acrílico giro derecho Wave', 'Iluminación', 4000.00, 0.00, 2450.00, 4, 0, 'pcs', true),

-- ACRILICO TABLERO SMASH 110
('490', 'ACRILICO TABLERO SMASH 110', 'Acrílico tablero Smash 110', 'Accesorios', 4700.00, 0.00, 2925.00, 5, 0, 'pcs', true),

-- ACRILICO TABLERO WAVE
('6584', 'ACRILICO TABLERO WAVE', 'Acrílico tablero Wave', 'Accesorios', 5000.00, 0.00, 3010.00, 1, 0, 'pcs', true),

-- ACRILICO TABLERO ZANELLA ZB
('607', 'ACRILICO TABLERO ZANELLA ZB', 'Acrílico tablero Zanella ZB', 'Accesorios', 3700.00, 0.00, 2150.00, 2, 0, 'pcs', true),

-- ACRILICO VELOCIMETRO YAMAHA CRYPTON
('709', 'ACRILICO VELOCIMETRO YAMAHA CRYPTON', 'Acrílico velocímetro Yamaha Crypton', 'Accesorios', 5500.00, 0.00, 3410.00, 2, 0, 'pcs', true),

-- ADAPTADOR DE ESPEJO D/I 10MM
('1788', 'ADAPTADOR DE ESPEJO D/I 10MM', 'Adaptador de espejo 10mm', 'Espejos', 1500.00, 0.00, 835.00, 4, 0, 'pcs', true),

-- AGARRADERA ACOMPAÑANTE SMASH
('1426', 'AGARRADERA ACOMPAÑANTE SMASH', 'Agarradera acompañante Smash', 'Accesorios', 5500.00, 0.00, 3080.00, 5, 0, 'pcs', true),

-- AGUA CON ADITIVO 1L VERDE MATCH
('1357', 'AGUA CON ADITIVO 1L VERDE MATCH', 'Agua con aditivo verde Match 1L', 'Refrigeración', 2000.00, 0.00, 1010.00, 1, 0, 'lt', true),

-- AGUA CON ADITIVO 5L AMARILLO MATCH
('1356', 'AGUA CON ADITIVO 5L AMARILLO MATCH', 'Agua con aditivo amarillo Match 5L', 'Refrigeración', 5500.00, 0.00, 3250.00, 3, 0, 'lt', true),

-- AGUA CON ADITIVO 5L ROSA MATCH
('1355', 'AGUA CON ADITIVO 5L ROSA MATCH', 'Agua con aditivo rosa Match 5L', 'Refrigeración', 5500.00, 0.00, 3380.00, 2, 0, 'lt', true),

-- AGUA CON ADITIVO 5L ROSA WANDER
('1358', 'AGUA CON ADITIVO 5L ROSA WANDER', 'Agua con aditivo rosa Wander 5L', 'Refrigeración', 5600.00, 0.00, 3510.00, 1, 0, 'lt', true),

-- AGUA DESMINERALIZADA 5L MATCH
('1359', 'AGUA DESMINERALIZADA 5L MATCH', 'Agua desmineralizada Match 5L', 'Refrigeración', 4000.00, 0.00, 2450.00, 0, 0, 'lt', true)

ON CONFLICT (codigo_sku) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  categoria = EXCLUDED.categoria,
  precio = EXCLUDED.precio,
  precio_mayorista = EXCLUDED.precio_mayorista,
  costo = EXCLUDED.costo,
  stock = EXCLUDED.stock,
  stock_minimo = EXCLUDED.stock_minimo,
  unidad_medida = EXCLUDED.unidad_medida,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- 4. Verificar la carga de datos
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  AVG(precio) as precio_promedio,
  SUM(stock_minimo) as stock_minimo_total
FROM productos;

-- 5. Mostrar algunos productos como ejemplo
SELECT 
  codigo_sku,
  nombre,
  costo,
  precio,
  precio_mayorista,
  stock,
  stock_minimo,
  categoria
FROM productos 
ORDER BY created_at 
LIMIT 10;

-- 6. Mostrar estadísticas por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad_productos,
  SUM(stock) as stock_total,
  AVG(precio) as precio_promedio
FROM productos 
GROUP BY categoria 
ORDER BY cantidad_productos DESC;
