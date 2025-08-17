-- Script corregido para migrar productos del archivo producto.txt
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columna stock_minimo
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;

-- 2. Eliminar columna precio obsoleta (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'precio') THEN
        ALTER TABLE productos DROP COLUMN precio;
        RAISE NOTICE 'Columna precio eliminada';
    ELSE
        RAISE NOTICE 'Columna precio no existe, continuando...';
    END IF;
END $$;

-- 3. Eliminar todos los productos existentes
TRUNCATE TABLE productos RESTART IDENTITY CASCADE;

-- 4. Insertar productos del archivo producto.txt
-- Mapeo: Codigo -> codigo_sku, Descripcion -> nombre, Precio Costo -> costo, 
-- Precio Venta -> precio_minorista, Precio Mayoreo -> precio_mayorista,
-- Inventario -> stock, Inv. Minimo -> stock_minimo

INSERT INTO productos (
  codigo_sku, 
  nombre, 
  descripcion, 
  costo, 
  precio_minorista, 
  precio_mayorista, 
  stock, 
  stock_minimo,
  categoria, 
  unidad_medida, 
  activo
) VALUES 
('FOCO 110', 'FOCO 110', 'FOCO 110', 0.00, 1900.00, 0.00, 20, 0, 'Iluminación', 'Unidad', true),
('1728', 'ABRAZADERA 110', 'ABRAZADERA 110', 2150.00, 3800.00, 0.00, 4, 0, 'Suspensión', 'Unidad', true),
('1420', 'ABRAZADERA MANGUERA DE NAFTA', 'ABRAZADERA MANGUERA DE NAFTA', 74.00, 200.00, 0.00, 100, 0, 'Combustible', 'Unidad', true),
('1226', 'ACEITE 2T 100CC COMPETICION RECCINO', 'ACEITE 2T 100CC COMPETICION RECCINO', 1520.00, 4320.00, 0.00, 1, 2, 'Lubricantes', 'Litro', true),
('1772', 'ACEITE 2T CASTROL 1L', 'ACEITE 2T CASTROL 1L', 6630.00, 11000.00, 0.00, 2, 0, 'Lubricantes', 'Litro', true),
('54', 'ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', 'ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', 1190.00, 2000.00, 0.00, 27, 0, 'Lubricantes', 'Litro', true),
('1343', 'ACEITE CASTROL BLANCO', 'ACEITE CASTROL BLANCO', 5850.00, 9500.00, 0.00, 10, 0, 'Lubricantes', 'Litro', true),
('1272', 'ACEITE CASTROL GRIS', 'ACEITE CASTROL GRIS', 7000.00, 11000.00, 0.00, 24, 0, 'Lubricantes', 'Litro', true),
('1534', 'ACEITE CASTROL SEMI-SINTETICO POWER1', 'ACEITE CASTROL SEMI-SINTETICO POWER1', 9980.00, 14000.00, 0.00, 3, 0, 'Lubricantes', 'Litro', true),
('1603', 'ACEITE DE CADENA WALKER', 'ACEITE DE CADENA WALKER', 2620.00, 4200.00, 0.00, 0, 0, 'Lubricantes', 'Litro', true),
('51', 'ACEITE DE CADENA X 240 CM AEROTEK', 'ACEITE DE CADENA X 240 CM AEROTEK', 800.00, 2800.00, 0.00, 2, 5, 'Lubricantes', 'Litro', true),
('1686', 'ACEITE DE SUSPENSION 10W X 250CC MACH', 'ACEITE DE SUSPENSION 10W X 250CC MACH', 2470.00, 3900.00, 0.00, 9, 0, 'Lubricantes', 'Litro', true),
('1507', 'ACEITE DE SUSPENSION 15W FERCOL', 'ACEITE DE SUSPENSION 15W FERCOL', 2650.00, 4500.00, 0.00, 1, 0, 'Lubricantes', 'Litro', true),
('52', 'ACEITE DE SUSPENSION FORCES X 200CM WANDER', 'ACEITE DE SUSPENSION FORCES X 200CM WANDER', 1980.00, 3200.00, 0.00, 0, 0, 'Lubricantes', 'Litro', true),
('1725', 'ACEITE HONDA HGO 10W30', 'ACEITE HONDA HGO 10W30', 9500.00, 14500.00, 0.00, 14, 0, 'Lubricantes', 'Litro', true),
('1794', 'ACEITE IPONE 20W50 SEMI SINTETICO', 'ACEITE IPONE 20W50 SEMI SINTETICO', 11900.00, 17000.00, 0.00, 12, 0, 'Lubricantes', 'Litro', true),
('1770', 'ACEITE MOTUL 3000 20W50 MINERAL', 'ACEITE MOTUL 3000 20W50 MINERAL', 8750.00, 14000.00, 0.00, 10, 0, 'Lubricantes', 'Litro', true),
('1535', 'ACEITE MOTUL 5000 20W50 SEMISINTETICO', 'ACEITE MOTUL 5000 20W50 SEMISINTETICO', 9000.00, 14500.00, 0.00, 22, 0, 'Lubricantes', 'Litro', true),
('1450', 'ACEITE MOTUL 5100 SEMISINTETICO', 'ACEITE MOTUL 5100 SEMISINTETICO', 9920.00, 16000.00, 0.00, 3, 0, 'Lubricantes', 'Litro', true),
('1633', 'ACEITE MOTUL 7100', 'ACEITE MOTUL 7100', 21880.00, 31000.00, 0.00, 9, 0, 'Lubricantes', 'Litro', true),
('1282', 'ACEITE RIDERS 4T', 'ACEITE RIDERS 4T', 3080.00, 4000.00, 0.00, 124, 0, 'Lubricantes', 'Litro', true),
('53', 'ACEITE ROD YPF 20 W 50', 'ACEITE ROD YPF 20 W 50', 4500.00, 6500.00, 0.00, 250, 0, 'Lubricantes', 'Litro', true),
('551', 'ACEITE SHELL ADVACE AX3 ROJO', 'ACEITE SHELL ADVACE AX3 ROJO', 5700.00, 8500.00, 0.00, 0, 0, 'Lubricantes', 'Litro', true),
('550', 'ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', 'ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', 6600.00, 9800.00, 0.00, 0, 1, 'Lubricantes', 'Litro', true),
('1371', 'ACEITE WANDER 15W50 SEMI SINTETICO', 'ACEITE WANDER 15W50 SEMI SINTETICO', 4300.00, 7000.00, 0.00, 1, 0, 'Lubricantes', 'Litro', true),
('W0065', 'ACEITE WANDER MINERAL', 'ACEITE WANDER MINERAL', 3780.00, 6000.00, 0.00, 3, 0, 'Lubricantes', 'Litro', true),
('1536', 'ACEITE YAMALUBE 20W40', 'ACEITE YAMALUBE 20W40', 8740.00, 14000.00, 0.00, 4, 0, 'Lubricantes', 'Litro', true),
('1889', 'ACELERADOR RAPIDO ANONIZADOS', 'ACELERADOR RAPIDO ANONIZADOS', 12000.00, 24000.00, 0.00, 5, 0, 'Aceleración', 'Unidad', true),
('1430', 'ACELERADOR RAPIDO UNIVERSAL', 'ACELERADOR RAPIDO UNIVERSAL', 3925.00, 7000.00, 0.00, 3, 0, 'Aceleración', 'Unidad', true),
('153', 'ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA', 'ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA', 4890.00, 7900.00, 0.00, 0, 0, 'Aceleración', 'Unidad', true),
('6425', 'ACELERADOR SMASH/BIZ/TRIP 110', 'ACELERADOR SMASH/BIZ/TRIP 110', 2890.00, 4700.00, 0.00, 0, 0, 'Aceleración', 'Unidad', true),
('1802', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 2900.00, 5000.00, 0.00, 6, 0, 'Limpieza', 'Unidad', true),
('SM036', 'ACOPLE CARBURADOR DE FILTRO DAKAR200', 'ACOPLE CARBURADOR DE FILTRO DAKAR200', 2100.00, 3400.00, 0.00, 3, 0, 'Carburación', 'Unidad', true),
('SAM0368', 'ACOPLE DE CARBURADOR TITAN150', 'ACOPLE DE CARBURADOR TITAN150', 2990.00, 4800.00, 0.00, 2, 0, 'Carburación', 'Unidad', true),
('SM0365', 'ACOPLE FILTRO RX150', 'ACOPLE FILTRO RX150', 1350.00, 2200.00, 0.00, 2, 0, 'Carburación', 'Unidad', true),
('526', 'ACRILICO FAROL DELANTERO H WAVE', 'ACRILICO FAROL DELANTERO H WAVE', 2080.00, 4000.00, 0.00, 1, 0, 'Iluminación', 'Unidad', true),
('546', 'ACRILICO FAROL GIRO WAVE IZQUIERDO', 'ACRILICO FAROL GIRO WAVE IZQUIERDO', 2450.00, 4000.00, 0.00, 4, 0, 'Iluminación', 'Unidad', true),
('435', 'ACRILICO FAROL TRAS DERECHO SMASH', 'ACRILICO FAROL TRAS DERECHO SMASH', 1500.00, 3000.00, 0.00, 1, 0, 'Iluminación', 'Unidad', true),
('436', 'ACRILICO FAROL TRAS IZQUIERDO SMASH', 'ACRILICO FAROL TRAS IZQUIERDO SMASH', 1500.00, 3000.00, 0.00, 0, 0, 'Iluminación', 'Unidad', true),
('433', 'ACRILICO FAROL TRASERO BIZ/ MOTOMEL ZANELA ROJO', 'ACRILICO FAROL TRASERO BIZ/ MOTOMEL ZANELA ROJO', 3640.00, 5900.00, 0.00, 5, 0, 'Iluminación', 'Unidad', true),
('434', 'ACRILICO FAROL TRASERO CRISTAL SMASH Y OTRAS', 'ACRILICO FAROL TRASERO CRISTAL SMASH Y OTRAS', 3640.00, 5900.00, 0.00, 3, 0, 'Iluminación', 'Unidad', true),
('496', 'ACRILICO FAROL TRASERO ROJO WAVE', 'ACRILICO FAROL TRASERO ROJO WAVE', 2630.00, 4500.00, 0.00, 4, 1, 'Iluminación', 'Unidad', true),
('547', 'ACRILICO GIRO DERECHO WAVE', 'ACRILICO GIRO DERECHO WAVE', 2450.00, 4000.00, 0.00, 4, 0, 'Iluminación', 'Unidad', true),
('490', 'ACRILICO TABLERO SMASH 110', 'ACRILICO TABLERO SMASH 110', 2925.00, 4700.00, 0.00, 5, 0, 'Instrumentos', 'Unidad', true),
('6584', 'ACRILICO TABLERO WAVE', 'ACRILICO TABLERO WAVE', 3010.00, 5000.00, 0.00, 1, 0, 'Instrumentos', 'Unidad', true),
('607', 'ACRILICO TABLERO ZANELLA ZB', 'ACRILICO TABLERO ZANELLA ZB', 2150.00, 3700.00, 0.00, 2, 0, 'Instrumentos', 'Unidad', true),
('709', 'ACRILICO VELOCIMETRO YAMAHA CRYPTON', 'ACRILICO VELOCIMETRO YAMAHA CRYPTON', 3410.00, 5500.00, 0.00, 2, 0, 'Instrumentos', 'Unidad', true),
('1788', 'ADAPTADOR DE ESPEJO D/I 10MM', 'ADAPTADOR DE ESPEJO D/I 10MM', 835.00, 1500.00, 0.00, 4, 0, 'Espejos', 'Unidad', true),
('1426', 'AGARRADERA ACOMPAÑANTE SMASH', 'AGARRADERA ACOMPAÑANTE SMASH', 2725.00, 5000.00, 0.00, 1, 0, 'Accesorios', 'Unidad', true),
('1357', 'AGUA CON ADITIVO 1L VERDE MATCH', 'AGUA CON ADITIVO 1L VERDE MATCH', 1010.00, 2000.00, 0.00, 1, 0, 'Refrigeración', 'Litro', true),
('1356', 'AGUA CON ADITIVO 5L AMARILLO MATCH', 'AGUA CON ADITIVO 5L AMARILLO MATCH', 3250.00, 5500.00, 0.00, 3, 0, 'Refrigeración', 'Litro', true),
('1355', 'AGUA CON ADITIVO 5L ROSA MATCH', 'AGUA CON ADITIVO 5L ROSA MATCH', 3380.00, 5500.00, 0.00, 2, 0, 'Refrigeración', 'Litro', true),
('1358', 'AGUA CON ADITIVO 5L ROSA WANDER', 'AGUA CON ADITIVO 5L ROSA WANDER', 3510.00, 5600.00, 0.00, 1, 0, 'Refrigeración', 'Litro', true),
('1359', 'AGUA DESMINERALIZADA 5L MATCH', 'AGUA DESMINERALIZADA 5L MATCH', 2450.00, 4000.00, 0.00, 0, 0, 'Refrigeración', 'Litro', true);

-- Verificar la migración
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  AVG(precio_minorista) as precio_promedio,
  SUM(stock_minimo) as stock_minimo_total
FROM productos;

-- Mostrar algunos productos como ejemplo
SELECT 
  codigo_sku,
  nombre,
  costo,
  precio_minorista,
  precio_mayorista,
  stock,
  stock_minimo,
  categoria
FROM productos 
ORDER BY created_at 
LIMIT 10;
