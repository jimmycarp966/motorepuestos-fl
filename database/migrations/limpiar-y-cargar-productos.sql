-- Script para limpiar todas las tablas y cargar productos desde produc.txt
-- Este script elimina todos los datos excepto empleados y carga los productos

-- ===== LIMPIAR TABLAS =====

-- 1. Limpiar ventas (si existe la tabla detalles_venta)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'detalles_venta') THEN
        DELETE FROM detalles_venta;
    END IF;
END $$;

DELETE FROM ventas;

-- 2. Limpiar caja y movimientos
DELETE FROM movimientos_caja;
DELETE FROM cajas;

-- 3. Limpiar clientes
DELETE FROM clientes;

-- 4. Limpiar productos
DELETE FROM productos;

-- 5. Limpiar arqueos (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'arqueos') THEN
        DELETE FROM arqueos;
    END IF;
END $$;

-- 6. Limpiar facturación AFIP (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'facturas_afip') THEN
        DELETE FROM facturas_afip;
    END IF;
END $$;

-- 7. Limpiar cuenta corriente (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movimientos_cuenta_corriente') THEN
        DELETE FROM movimientos_cuenta_corriente;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cuentas_corrientes') THEN
        DELETE FROM cuentas_corrientes;
    END IF;
END $$;

-- ===== RESETEAR SECUENCIAS =====

-- Resetear secuencias de IDs (solo las que existen)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'productos_id_seq') THEN
        ALTER SEQUENCE productos_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'ventas_id_seq') THEN
        ALTER SEQUENCE ventas_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'detalles_venta_id_seq') THEN
        ALTER SEQUENCE detalles_venta_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'clientes_id_seq') THEN
        ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'cajas_id_seq') THEN
        ALTER SEQUENCE cajas_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'movimientos_caja_id_seq') THEN
        ALTER SEQUENCE movimientos_caja_id_seq RESTART WITH 1;
    END IF;
END $$;

-- ===== CARGAR PRODUCTOS DESDE PRODUC.TXT =====

INSERT INTO productos (sku, nombre, descripcion, precio_costo, precio_venta, precio_mayoreo, stock_actual, stock_minimo, categoria, activo, created_at, updated_at) VALUES
('FOCO 110', 'FOCO 110', 'Foco para motocicleta 110', 0.00, 1900.00, 0.00, 20, 0, 'Iluminación', true, NOW(), NOW()),
('1728', 'ABRAZADERA 110', 'Abrazadera para motocicleta 110', 2150.00, 3800.00, 0.00, 4, 0, 'Suspensión', true, NOW(), NOW()),
('1420', 'ABRAZADERA MANGUERA DE NAFTA', 'Abrazadera para manguera de nafta', 74.00, 200.00, 0.00, 100, 0, 'Combustible', true, NOW(), NOW()),
('1226', 'ACEITE 2T 100CC COMPETICION RECCINO', 'Aceite 2T 100CC para competición Reccino', 1520.00, 4320.00, 0.00, 1, 2, 'Lubricantes', true, NOW(), NOW()),
('1772', 'ACEITE 2T CASTROL 1L', 'Aceite 2T Castrol 1 litro', 6630.00, 11000.00, 0.00, 2, 0, 'Lubricantes', true, NOW(), NOW()),
('54', 'ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', 'Aceite 2T 100CC para 2 tiempos Mach/Wander', 1190.00, 2000.00, 0.00, 27, 0, 'Lubricantes', true, NOW(), NOW()),
('1343', 'ACEITE CASTROL BLANCO', 'Aceite Castrol blanco', 5850.00, 9500.00, 0.00, 7, 0, 'Lubricantes', true, NOW(), NOW()),
('1272', 'ACEITE CASTROL GRIS', 'Aceite Castrol gris', 7000.00, 11000.00, 0.00, 21, 0, 'Lubricantes', true, NOW(), NOW()),
('1534', 'ACEITE CASTROL SEMI-SINTETICO POWER1', 'Aceite Castrol semi-sintético Power1', 9980.00, 14000.00, 0.00, 2, 0, 'Lubricantes', true, NOW(), NOW()),
('1603', 'ACEITE DE CADENA WALKER', 'Aceite para cadena Walker', 2620.00, 4200.00, 0.00, 0, 0, 'Lubricantes', true, NOW(), NOW()),
('51', 'ACEITE DE CADENA X 240 CM AEROTEK', 'Aceite para cadena 240cm Aerotek', 800.00, 2800.00, 0.00, 2, 5, 'Lubricantes', true, NOW(), NOW()),
('1686', 'ACEITE DE SUSPENSION 10W X 250CC MACH', 'Aceite de suspensión 10W 250cc Mach', 2470.00, 3900.00, 0.00, 8, 0, 'Suspensión', true, NOW(), NOW()),
('1507', 'ACEITE DE SUSPENSION 15W FERCOL', 'Aceite de suspensión 15W Fercol', 2650.00, 4500.00, 0.00, 1, 0, 'Suspensión', true, NOW(), NOW()),
('52', 'ACEITE DE SUSPENSION FORCES X 200CM WANDER', 'Aceite de suspensión Forces 200cm Wander', 1980.00, 3200.00, 0.00, 0, 0, 'Suspensión', true, NOW(), NOW()),
('1725', 'ACEITE HONDA HGO 10W30', 'Aceite Honda HGO 10W30', 9500.00, 14500.00, 0.00, 14, 0, 'Lubricantes', true, NOW(), NOW()),
('1794', 'ACEITE IPONE 20W50 SEMI SINTETICO', 'Aceite Ipone 20W50 semi sintético', 11900.00, 17000.00, 0.00, 12, 0, 'Lubricantes', true, NOW(), NOW()),
('1770', 'ACEITE MOTUL 3000 20W50 MINERAL', 'Aceite Motul 3000 20W50 mineral', 8750.00, 14000.00, 0.00, 10, 0, 'Lubricantes', true, NOW(), NOW()),
('1535', 'ACEITE MOTUL 5000 20W50 SEMISINTETICO', 'Aceite Motul 5000 20W50 semi sintético', 9000.00, 14500.00, 0.00, 21, 0, 'Lubricantes', true, NOW(), NOW()),
('1450', 'ACEITE MOTUL 5100 SEMISINTETICO', 'Aceite Motul 5100 semi sintético', 9920.00, 16000.00, 0.00, 3, 0, 'Lubricantes', true, NOW(), NOW()),
('1633', 'ACEITE MOTUL 7100', 'Aceite Motul 7100', 21880.00, 31000.00, 0.00, 7, 0, 'Lubricantes', true, NOW(), NOW()),
('1282', 'ACEITE RIDERS 4T', 'Aceite Riders 4T', 3080.00, 4000.00, 0.00, 114, 0, 'Lubricantes', true, NOW(), NOW()),
('53', 'ACEITE ROD YPF 20 W 50', 'Aceite ROD YPF 20W50', 4500.00, 6500.00, 0.00, 232, 0, 'Lubricantes', true, NOW(), NOW()),
('551', 'ACEITE SHELL ADVACE AX3 ROJO', 'Aceite Shell Advance AX3 rojo', 5700.00, 8500.00, 0.00, 0, 0, 'Lubricantes', true, NOW(), NOW()),
('550', 'ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', 'Aceite Shell Advance 20W50 AX5 amarillo', 6600.00, 9800.00, 0.00, 0, 1, 'Lubricantes', true, NOW(), NOW()),
('1371', 'ACEITE WANDER 15W50 SEMI SINTETICO', 'Aceite Wander 15W50 semi sintético', 4300.00, 7000.00, 0.00, 1, 0, 'Lubricantes', true, NOW(), NOW()),
('W0065', 'ACEITE WANDER MINERAL', 'Aceite Wander mineral', 3780.00, 6000.00, 0.00, 3, 0, 'Lubricantes', true, NOW(), NOW()),
('1536', 'ACEITE YAMALUBE 20W40', 'Aceite Yamalube 20W40', 8740.00, 14000.00, 0.00, 4, 0, 'Lubricantes', true, NOW(), NOW()),
('1889', 'ACELERADOR RAPIDO ANONIZADOS', 'Acelerador rápido anodizado', 12000.00, 24000.00, 0.00, 5, 0, 'Accesorios', true, NOW(), NOW()),
('1430', 'ACELERADOR RAPIDO UNIVERSAL', 'Acelerador rápido universal', 3925.00, 7000.00, 0.00, 3, 0, 'Accesorios', true, NOW(), NOW()),
('153', 'ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA', 'Acelerador rápido universal aluminio Skua', 4890.00, 7900.00, 0.00, 0, 0, 'Accesorios', true, NOW(), NOW()),
('6425', 'ACELERADOR SMASH/BIZ/TRIP 110', 'Acelerador para Smash/Biz/Trip 110', 2890.00, 4700.00, 0.00, 0, 0, 'Accesorios', true, NOW(), NOW()),
('1802', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 'Acondicionador de superficie/Dessing Protectant', 2900.00, 5000.00, 0.00, 6, 0, 'Limpieza', true, NOW(), NOW()),
('SM036', 'ACOPLE CARBURADOR DE FILTRO DAKAR200', 'Acople de carburador para filtro Dakar200', 2100.00, 3400.00, 0.00, 3, 0, 'Carburación', true, NOW(), NOW()),
('SAM0368', 'ACOPLE DE CARBURADOR TITAN150', 'Acople de carburador Titan150', 2990.00, 4800.00, 0.00, 2, 0, 'Carburación', true, NOW(), NOW()),
('SM0365', 'ACOPLE FILTRO RX150', 'Acople para filtro RX150', 1350.00, 2200.00, 0.00, 2, 0, 'Carburación', true, NOW(), NOW()),
('526', 'ACRILICO FAROL DELANTERO H WAVE', 'Acrílico farol delantero H Wave', 2080.00, 4000.00, 0.00, 1, 0, 'Iluminación', true, NOW(), NOW()),
('546', 'ACRILICO FAROL GIRO WAVE IZQUIERDO', 'Acrílico farol de giro Wave izquierdo', 2450.00, 4000.00, 0.00, 4, 0, 'Iluminación', true, NOW(), NOW()),
('435', 'ACRILICO FAROL TRAS DERECHO SMASH', 'Acrílico farol trasero derecho Smash', 1500.00, 3000.00, 0.00, 1, 0, 'Iluminación', true, NOW(), NOW()),
('436', 'ACRILICO FAROL TRAS IZQUIERDO SMASH', 'Acrílico farol trasero izquierdo Smash', 1500.00, 3000.00, 0.00, 0, 0, 'Iluminación', true, NOW(), NOW()),
('433', 'ACRILICO FAROL TRASERO BIZ/ MOTOMEL ZANELA ROJO', 'Acrílico farol trasero Biz/Motomel Zanela rojo', 3640.00, 5900.00, 0.00, 5, 0, 'Iluminación', true, NOW(), NOW()),
('434', 'ACRILICO FAROL TRASERO CRISTAL SMASH Y OTRAS', 'Acrílico farol trasero cristal Smash y otras', 3640.00, 5900.00, 0.00, 3, 0, 'Iluminación', true, NOW(), NOW()),
('496', 'ACRILICO FAROL TRASERO ROJO WAVE', 'Acrílico farol trasero rojo Wave', 2630.00, 4500.00, 0.00, 4, 1, 'Iluminación', true, NOW(), NOW()),
('547', 'ACRILICO GIRO DERECHO WAVE', 'Acrílico giro derecho Wave', 2450.00, 4000.00, 0.00, 4, 0, 'Iluminación', true, NOW(), NOW()),
('490', 'ACRILICO TABLERO SMASH 110', 'Acrílico tablero Smash 110', 2925.00, 4700.00, 0.00, 5, 0, 'Instrumentos', true, NOW(), NOW()),
('6584', 'ACRILICO TABLERO WAVE', 'Acrílico tablero Wave', 3010.00, 5000.00, 0.00, 1, 0, 'Instrumentos', true, NOW(), NOW()),
('607', 'ACRILICO TABLERO ZANELLA ZB', 'Acrílico tablero Zanella ZB', 2150.00, 3700.00, 0.00, 2, 0, 'Instrumentos', true, NOW(), NOW()),
('709', 'ACRILICO VELOCIMETRO YAMAHA CRYPTON', 'Acrílico velocímetro Yamaha Crypton', 3410.00, 5500.00, 0.00, 2, 0, 'Instrumentos', true, NOW(), NOW()),
('1788', 'ADAPTADOR DE ESPEJO D/I 10MM', 'Adaptador de espejo D/I 10mm', 835.00, 1500.00, 0.00, 4, 0, 'Accesorios', true, NOW(), NOW()),
('1426', 'AGARRADERA ACOMPAÑANTE SMASH', 'Agarradera acompañante Smash', 3080.00, 5500.00, 0.00, 5, 0, 'Accesorios', true, NOW(), NOW()),
('1357', 'AGUA CON ADITIVO 1L VERDE MATCH', 'Agua con aditivo 1L verde Match', 1010.00, 2000.00, 0.00, 1, 0, 'Refrigeración', true, NOW(), NOW()),
('1356', 'AGUA CON ADITIVO 5L AMARILLO MATCH', 'Agua con aditivo 5L amarillo Match', 3250.00, 5500.00, 0.00, 3, 0, 'Refrigeración', true, NOW(), NOW()),
('1355', 'AGUA CON ADITIVO 5L ROSA MATCH', 'Agua con aditivo 5L rosa Match', 3380.00, 5500.00, 0.00, 2, 0, 'Refrigeración', true, NOW(), NOW()),
('1358', 'AGUA CON ADITIVO 5L ROSA WANDER', 'Agua con aditivo 5L rosa Wander', 3510.00, 5600.00, 0.00, 1, 0, 'Refrigeración', true, NOW(), NOW()),
('1359', 'AGUA DESMINERALIZADA 5L MATCH', 'Agua desmineralizada 5L Match', 2450.00, 4000.00, 0.00, 0, 0, 'Refrigeración', true, NOW(), NOW());

-- ===== VERIFICACIÓN =====

-- Verificar que las tablas estén limpias
SELECT 'productos' as tabla, COUNT(*) as registros FROM productos
UNION ALL
SELECT 'ventas' as tabla, COUNT(*) as registros FROM ventas
UNION ALL
SELECT 'clientes' as tabla, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'cajas' as tabla, COUNT(*) as registros FROM cajas
UNION ALL
SELECT 'movimientos_caja' as tabla, COUNT(*) as registros FROM movimientos_caja
UNION ALL
SELECT 'empleados' as tabla, COUNT(*) as registros FROM empleados;

-- Mostrar productos cargados
SELECT 
  sku,
  nombre,
  precio_costo,
  precio_venta,
  precio_mayoreo,
  stock_actual,
  stock_minimo,
  categoria
FROM productos 
ORDER BY nombre 
LIMIT 20;

-- Mostrar estadísticas de productos por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad_productos,
  SUM(stock_actual) as stock_total,
  AVG(precio_venta) as precio_promedio
FROM productos 
GROUP BY categoria 
ORDER BY cantidad_productos DESC;
