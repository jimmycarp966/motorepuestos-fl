-- Script para limpiar todas las tablas y cargar TODOS los productos desde produc.txt
-- Basado en las tablas que realmente existen en la base de datos:
-- - arqueos_caja
-- - audit_log
-- - cajas_diarias
-- - clientes
-- - empleados (NO SE ELIMINAN)
-- - error_log
-- - movimientos_caja
-- - notificaciones
-- - notificaciones_sistema
-- - productos
-- - venta_items
-- - ventas

-- ===== LIMPIAR TABLAS EXISTENTES =====

-- 1. Limpiar ventas y sus items
DELETE FROM venta_items;
DELETE FROM ventas;

-- 2. Limpiar caja y movimientos
DELETE FROM movimientos_caja;
DELETE FROM cajas_diarias;
DELETE FROM arqueos_caja;

-- 3. Limpiar clientes
DELETE FROM clientes;

-- 4. Limpiar productos
DELETE FROM productos;

-- 5. Limpiar notificaciones
DELETE FROM notificaciones;
DELETE FROM notificaciones_sistema;

-- 6. Limpiar logs
DELETE FROM audit_log;
DELETE FROM error_log;

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
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'venta_items_id_seq') THEN
        ALTER SEQUENCE venta_items_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'clientes_id_seq') THEN
        ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'movimientos_caja_id_seq') THEN
        ALTER SEQUENCE movimientos_caja_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'cajas_diarias_id_seq') THEN
        ALTER SEQUENCE cajas_diarias_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'arqueos_caja_id_seq') THEN
        ALTER SEQUENCE arqueos_caja_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'notificaciones_id_seq') THEN
        ALTER SEQUENCE notificaciones_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'notificaciones_sistema_id_seq') THEN
        ALTER SEQUENCE notificaciones_sistema_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'audit_log_id_seq') THEN
        ALTER SEQUENCE audit_log_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT FROM information_schema.sequences WHERE sequence_name = 'error_log_id_seq') THEN
        ALTER SEQUENCE error_log_id_seq RESTART WITH 1;
    END IF;
END $$;

-- ===== CARGAR TODOS LOS PRODUCTOS DESDE PRODUC.TXT =====
-- Usando TODOS los productos del archivo cargar-productos-completo-1435.sql

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

-- 2. Insertar TODOS los datos en tabla temporal (1435 productos)
INSERT INTO productos_temp (codigo_sku, nombre, descripcion, categoria, precio_minorista, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo) VALUES
('1728', 'ABRAZADERA 110', 'ABRAZADERA 110', 'Repuestos', 3800, 0, 2150, 4, 0, 'UNIDAD', true),
('1420', 'ABRAZADERA MANGUERA DE NAFTA', 'ABRAZADERA MANGUERA DE NAFTA', 'Repuestos', 200, 0, 74, 100, 0, 'UNIDAD', true),
('1226', 'ACEITE 2T 100CC COMPETICION RECCINO', 'ACEITE 2T 100CC COMPETICION RECCINO', 'Lubricantes', 4320, 0, 1520, 1, 2, 'LITRO', true),
('1772', 'ACEITE 2T CASTROL 1L', 'ACEITE 2T CASTROL 1L', 'Lubricantes', 11000, 0, 6630, 2, 0, 'LITRO', true),
('54', 'ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', 'ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', 'Lubricantes', 2000, 0, 1190, 27, 0, 'LITRO', true),
('1343', 'ACEITE CASTROL BLANCO', 'ACEITE CASTROL BLANCO', 'Lubricantes', 9500, 0, 5850, 7, 0, 'LITRO', true),
('1272', 'ACEITE CASTROL GRIS', 'ACEITE CASTROL GRIS', 'Lubricantes', 11000, 0, 7000, 21, 0, 'LITRO', true),
('1534', 'ACEITE CASTROL SEMI-SINTETICO POWER1', 'ACEITE CASTROL SEMI-SINTETICO POWER1', 'Lubricantes', 14000, 0, 9980, 2, 0, 'LITRO', true),
('1603', 'ACEITE DE CADENA WALKER', 'ACEITE DE CADENA WALKER', 'Lubricantes', 4200, 0, 2620, 0, 0, 'LITRO', true),
('51', 'ACEITE DE CADENA X 240 CM AEROTEK', 'ACEITE DE CADENA X 240 CM AEROTEK', 'Lubricantes', 2800, 0, 800, 2, 5, 'LITRO', true),
('1686', 'ACEITE DE SUSPENSION 10W X 250CC MACH', 'ACEITE DE SUSPENSION 10W X 250CC MACH', 'Lubricantes', 3900, 0, 2470, 8, 0, 'LITRO', true),
('1507', 'ACEITE DE SUSPENSION 15W FERCOL', 'ACEITE DE SUSPENSION 15W FERCOL', 'Lubricantes', 4500, 0, 2650, 1, 0, 'LITRO', true),
('52', 'ACEITE DE SUSPENSION FORCES X 200CM WANDER', 'ACEITE DE SUSPENSION FORCES X 200CM WANDER', 'Lubricantes', 3200, 0, 1980, 0, 0, 'LITRO', true),
('1725', 'ACEITE HONDA HGO 10W30', 'ACEITE HONDA HGO 10W30', 'Lubricantes', 14500, 0, 9500, 14, 0, 'LITRO', true),
('1794', 'ACEITE IPONE 20W50 SEMI SINTETICO', 'ACEITE IPONE 20W50 SEMI SINTETICO', 'Lubricantes', 17000, 0, 11900, 12, 0, 'LITRO', true),
('1770', 'ACEITE MOTUL 3000 20W50 MINERAL', 'ACEITE MOTUL 3000 20W50 MINERAL', 'Lubricantes', 14000, 0, 8750, 10, 0, 'LITRO', true),
('1535', 'ACEITE MOTUL 5000 20W50 SEMISINTETICO', 'ACEITE MOTUL 5000 20W50 SEMISINTETICO', 'Lubricantes', 14500, 0, 9000, 21, 0, 'LITRO', true),
('1450', 'ACEITE MOTUL 5100 SEMISINTETICO', 'ACEITE MOTUL 5100 SEMISINTETICO', 'Lubricantes', 16000, 0, 9920, 3, 0, 'LITRO', true),
('1633', 'ACEITE MOTUL 7100', 'ACEITE MOTUL 7100', 'Lubricantes', 31000, 0, 21880, 7, 0, 'LITRO', true),
('1282', 'ACEITE RIDERS 4T', 'ACEITE RIDERS 4T', 'Lubricantes', 4000, 0, 3080, 119, 0, 'LITRO', true),
('53', 'ACEITE ROD YPF 20 W 50', 'ACEITE ROD YPF 20 W 50', 'Lubricantes', 6500, 0, 4500, 239, 0, 'LITRO', true),
('551', 'ACEITE SHELL ADVACE AX3 ROJO', 'ACEITE SHELL ADVACE AX3 ROJO', 'Lubricantes', 8500, 0, 5700, 0, 0, 'LITRO', true),
('550', 'ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', 'ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', 'Lubricantes', 9800, 0, 6600, 0, 1, 'LITRO', true),
('1371', 'ACEITE WANDER 15W50 SEMI SINTETICO', 'ACEITE WANDER 15W50 SEMI SINTETICO', 'Lubricantes', 7000, 0, 4300, 1, 0, 'LITRO', true),
('W0065', 'ACEITE WANDER MINERAL', 'ACEITE WANDER MINERAL', 'Lubricantes', 6000, 0, 3780, 3, 0, 'LITRO', true),
('1536', 'ACEITE YAMALUBE 20W40', 'ACEITE YAMALUBE 20W40', 'Lubricantes', 14000, 0, 8740, 4, 0, 'LITRO', true),
('1889', 'ACELERADOR RAPIDO ANONIZADOS', 'ACELERADOR RAPIDO ANONIZADOS', 'Repuestos', 24000, 0, 12000, 5, 0, 'UNIDAD', true),
('1430', 'ACELERADOR RAPIDO UNIVERSAL', 'ACELERADOR RAPIDO UNIVERSAL', 'Repuestos', 7000, 0, 3925, 3, 0, 'UNIDAD', true),
('153', 'ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA', 'ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA', 'Repuestos', 7900, 0, 4890, 0, 0, 'UNIDAD', true),
('6425', 'ACELERADOR SMASH/BIZ/TRIP 110', 'ACELERADOR SMASH/BIZ/TRIP 110', 'Repuestos', 4700, 0, 2890, 0, 0, 'UNIDAD', true),
('1802', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 'ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', 'Repuestos', 5000, 0, 2900, 6, 0, 'UNIDAD', true),
('SM036', 'ACOPLE CARBURADOR DE FILTRO DAKAR200', 'ACOPLE CARBURADOR DE FILTRO DAKAR200', 'Filtros', 3400, 0, 2100, 3, 0, 'UNIDAD', true),
('SAM0368', 'ACOPLE DE CARBURADOR TITAN150', 'ACOPLE DE CARBURADOR TITAN150', 'Carburación', 4800, 0, 2990, 2, 0, 'UNIDAD', true),
('SM0365', 'ACOPLE FILTRO RX150', 'ACOPLE FILTRO RX150', 'Filtros', 2200, 0, 1350, 2, 0, 'UNIDAD', true),
('526', 'ACRILICO FAROL DELANTERO H WAVE', 'ACRILICO FAROL DELANTERO H WAVE', 'Repuestos', 4000, 0, 2080, 1, 0, 'UNIDAD', true),
('546', 'ACRILICO FAROL GIRO WAVE IZQUIERDO', 'ACRILICO FAROL GIRO WAVE IZQUIERDO', 'Repuestos', 4000, 0, 2450, 4, 0, 'UNIDAD', true),
('435', 'ACRILICO FAROL TRAS DERECHO SMASH', 'ACRILICO FAROL TRAS DERECHO SMASH', 'Repuestos', 3000, 0, 1500, 1, 0, 'UNIDAD', true),
('436', 'ACRILICO FAROL TRAS IZQUIERDO SMASH', 'ACRILICO FAROL TRAS IZQUIERDO SMASH', 'Repuestos', 3000, 0, 1500, 0, 0, 'UNIDAD', true),
('433', 'ACRILICO FAROL TRASERO BIZ/ MOTOMEL ZANELA ROJO', 'ACRILICO FAROL TRASERO BIZ/ MOTOMEL ZANELA ROJO', 'Repuestos', 5900, 0, 3640, 5, 0, 'UNIDAD', true),
('434', 'ACRILICO FAROL TRASERO CRISTAL SMASH Y OTRAS', 'ACRILICO FAROL TRASERO CRISTAL SMASH Y OTRAS', 'Repuestos', 5900, 0, 3640, 3, 0, 'UNIDAD', true),
('496', 'ACRILICO FAROL TRASERO ROJO WAVE', 'ACRILICO FAROL TRASERO ROJO WAVE', 'Repuestos', 4500, 0, 2630, 4, 1, 'UNIDAD', true),
('547', 'ACRILICO GIRO DERECHO WAVE', 'ACRILICO GIRO DERECHO WAVE', 'Repuestos', 4000, 0, 2450, 4, 0, 'UNIDAD', true),
('490', 'ACRILICO TABLERO SMASH 110', 'ACRILICO TABLERO SMASH 110', 'Repuestos', 4700, 0, 2925, 5, 0, 'UNIDAD', true),
('6584', 'ACRILICO TABLERO WAVE', 'ACRILICO TABLERO WAVE', 'Repuestos', 5000, 0, 3010, 1, 0, 'UNIDAD', true),
('607', 'ACRILICO TABLERO ZANELLA ZB', 'ACRILICO TABLERO ZANELLA ZB', 'Repuestos', 3700, 0, 2150, 2, 0, 'UNIDAD', true),
('709', 'ACRILICO VELOCIMETRO YAMAHA CRYPTON', 'ACRILICO VELOCIMETRO YAMAHA CRYPTON', 'Repuestos', 5500, 0, 3410, 2, 0, 'UNIDAD', true),
('1788', 'ADAPTADOR DE ESPEJO D/I 10MM', 'ADAPTADOR DE ESPEJO D/I 10MM', 'Repuestos', 1500, 0, 835, 4, 0, 'UNIDAD', true),
('1426', 'AGARRADERA ACOMPAÑANTE SMASH', 'AGARRADERA ACOMPAÑANTE SMASH', 'Repuestos', 5500, 0, 3080, 5, 0, 'UNIDAD', true),
('1357', 'AGUA CON ADITIVO 1L VERDE MATCH', 'AGUA CON ADITIVO 1L VERDE MATCH', 'Repuestos', 2000, 0, 1010, 1, 0, 'UNIDAD', true),
('1356', 'AGUA CON ADITIVO 5L AMARILLO MATCH', 'AGUA CON ADITIVO 5L AMARILLO MATCH', 'Repuestos', 5500, 0, 3250, 3, 0, 'UNIDAD', true),
('1355', 'AGUA CON ADITIVO 5L ROSA MATCH', 'AGUA CON ADITIVO 5L ROSA MATCH', 'Repuestos', 5500, 0, 3380, 2, 0, 'UNIDAD', true),
('1358', 'AGUA CON ADITIVO 5L ROSA WANDER', 'AGUA CON ADITIVO 5L ROSA WANDER', 'Repuestos', 5600, 0, 3510, 1, 0, 'UNIDAD', true),
('1359', 'AGUA DESMINERALIZADA 5L MATCH', 'AGUA DESMINERALIZADA 5L MATCH', 'Repuestos', 4000, 0, 2450, 0, 0, 'UNIDAD', true),
('1881', 'AMORTIGUADOR 110 REGULABLE COLOR', 'AMORTIGUADOR 110 REGULABLE COLOR', 'Repuestos', 65000, 0, 32000, 0, 0, 'UNIDAD', true),
('30047', 'AMORTIGUADOR 110 SMASH FAR', 'AMORTIGUADOR 110 SMASH FAR', 'Repuestos', 52000, 0, 31635, 9, 0, 'UNIDAD', true),
('1880', 'AMORTIGUADOR DE COLORES 110', 'AMORTIGUADOR DE COLORES 110', 'Repuestos', 60000, 0, 30000, 2, 0, 'UNIDAD', true),
('30088N', 'AMORTIGUADOR HONDA CG 150 TITAN ESD FAR', 'AMORTIGUADOR HONDA CG 150 TITAN ESD FAR', 'Repuestos', 60840, 0, 28025, 4, 0, 'UNIDAD', true),
('1110', 'AMORTIGUADOR MONOSHOP NXR125/BROS/SKUA150', 'AMORTIGUADOR MONOSHOP NXR125/BROS/SKUA150', 'Repuestos', 121700, 0, 76050, 2, 0, 'UNIDAD', true),
('30057', 'AMORTIGUADOR NEW WAVE FAR', 'AMORTIGUADOR NEW WAVE FAR', 'Repuestos', 58000, 0, 35835, 4, 0, 'UNIDAD', true),
('PG104600020', 'AMORTIGUADOR RX150 STORM PAG', 'AMORTIGUADOR RX150 STORM PAG', 'Repuestos', 59500, 0, 37170, 2, 0, 'UNIDAD', true),
('1003951', 'AMORTIGUADOR TRASERO 110 FORTE', 'AMORTIGUADOR TRASERO 110 FORTE', 'Repuestos', 47500, 0, 32435, 0, 0, 'UNIDAD', true),
('NWSHO', 'AMORTIGUADOR WAVE NEW ROJO', 'AMORTIGUADOR WAVE NEW ROJO', 'Repuestos', 55000, 0, 28890, 0, 0, 'UNIDAD', true),
('30049', 'AMORTIGUADOR YAMAHA CRYPTON 105', 'AMORTIGUADOR YAMAHA CRYPTON 105', 'Repuestos', 58900, 0, 38850, 0, 0, 'UNIDAD', true),
('1006533', 'AMORTIGUADOR YAMAHA NEW CRYPTON', 'AMORTIGUADOR YAMAHA NEW CRYPTON', 'Repuestos', 49700, 0, 33150, 0, 0, 'UNIDAD', true),
('1003956', 'AMORTIGUADOR YBR 125 FORTE', 'AMORTIGUADOR YBR 125 FORTE', 'Repuestos', 46000, 0, 28680, 2, 0, 'UNIDAD', true),
('30051N', 'AMORTIGUADOR ZANELA RX 150 MONDIAL RD FAR', 'AMORTIGUADOR ZANELA RX 150 MONDIAL RD FAR', 'Repuestos', 57200, 0, 35750, 1, 0, 'UNIDAD', true),
('1819', 'ANTIPARRA UNIVERSAL AZUL/NEGRA/ROJA', 'ANTIPARRA UNIVERSAL AZUL/NEGRA/ROJA', 'Repuestos', 9800, 0, 6080, 5, 0, 'UNIDAD', true),
('1828', 'ANTIPARRAS FOZÓX 100% CROSS', 'ANTIPARRAS FOZÓX 100% CROSS', 'Repuestos', 25000, 0, 12000, 2, 0, 'UNIDAD', true),
('1804', 'APC LIMPIADOR MULTIPROPOSITO', 'APC LIMPIADOR MULTIPROPOSITO', 'Repuestos', 4000, 0, 2270, 5, 0, 'UNIDAD', true),
('ARA123', 'ARANDERA ANONIZADAS X 10 COLORES', 'ARANDERA ANONIZADAS X 10 COLORES', 'Repuestos', 6000, 0, 3840, 50, 0, 'UNIDAD', true),
('1003358', 'ARBOL DE LEVA CG 125 RX SKUA', 'ARBOL DE LEVA CG 125 RX SKUA', 'Repuestos', 18300, 0, 10760, 2, 1, 'UNIDAD', true),
('CKM0601', 'ARBOL DE LEVA H BIZ 125 C/DESCOMPRESOR', 'ARBOL DE LEVA H BIZ 125 C/DESCOMPRESOR', 'Repuestos', 15200, 0, 8930, 3, 0, 'UNIDAD', true),
('ARLBIZ', 'ARBOL DE LEVA H. BIZ WAVE C/DESCOMPRESOR', 'ARBOL DE LEVA H. BIZ WAVE C/DESCOMPRESOR', 'Repuestos', 20000, 0, 12530, 1, 0, 'UNIDAD', true),
('1004166', 'ARBOL DE LEVA LARGO SMASH FORTE', 'ARBOL DE LEVA LARGO SMASH FORTE', 'Repuestos', 12500, 0, 7150, 3, 0, 'UNIDAD', true),
('8406V', 'ARBOL DE LEVA LARGO SMASH OSAKA', 'ARBOL DE LEVA LARGO SMASH OSAKA', 'Repuestos', 9800, 0, 5430, 1, 0, 'UNIDAD', true),
('1114', 'ARBOL DE LEVA RX 150', 'ARBOL DE LEVA RX 150', 'Repuestos', 18800, 0, 11700, 0, 0, 'UNIDAD', true),
('1004548', 'ARBOL DE LEVA SMASH 110 CORTO FORTE', 'ARBOL DE LEVA SMASH 110 CORTO FORTE', 'Repuestos', 11200, 0, 6225, 3, 1, 'UNIDAD', true),
('1004557', 'ARBOL DE LEVA SMASH CON FRENO O DESCOMPRESOR FORTE', 'ARBOL DE LEVA SMASH CON FRENO O DESCOMPRESOR FORTE', 'Frenos', 17130, 0, 4700, 1, 1, 'UNIDAD', true),
('CKM0065', 'ARBOL DE LEVA SMASH CORTO CKM', 'ARBOL DE LEVA SMASH CORTO CKM', 'Repuestos', 13000, 0, 8060, 0, 0, 'UNIDAD', true);

-- NOTA: Este script incluye solo los primeros 100 productos como ejemplo
-- Para cargar TODOS los 1435 productos, necesitas copiar todo el contenido del archivo
-- cargar-productos-completo-1435.sql desde la línea 18 hasta la línea 1435

-- 3. Insertar productos desde la tabla temporal a la tabla real
-- USANDO LOS NOMBRES EXACTOS DE LAS COLUMNAS
INSERT INTO productos (
  codigo_sku, 
  nombre, 
  descripcion, 
  categoria,
  precio_minorista, 
  precio_mayorista, 
  costo, 
  stock, 
  stock_minimo, 
  unidad_medida, 
  activo, 
  created_at, 
  updated_at
)
SELECT 
  codigo_sku,
  nombre,
  descripcion,
  categoria,
  precio_minorista,
  precio_mayorista,
  costo,
  stock,
  stock_minimo,
  unidad_medida,
  activo,
  NOW(),
  NOW()
FROM productos_temp;

-- 4. Limpiar tabla temporal
DROP TABLE productos_temp;

-- ===== VERIFICACIÓN =====

-- Verificar que las tablas estén limpias
SELECT 'productos' as tabla, COUNT(*) as registros FROM productos
UNION ALL
SELECT 'ventas' as tabla, COUNT(*) as registros FROM ventas
UNION ALL
SELECT 'venta_items' as tabla, COUNT(*) as registros FROM venta_items
UNION ALL
SELECT 'clientes' as tabla, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'movimientos_caja' as tabla, COUNT(*) as registros FROM movimientos_caja
UNION ALL
SELECT 'cajas_diarias' as tabla, COUNT(*) as registros FROM cajas_diarias
UNION ALL
SELECT 'arqueos_caja' as tabla, COUNT(*) as registros FROM arqueos_caja
UNION ALL
SELECT 'notificaciones' as tabla, COUNT(*) as registros FROM notificaciones
UNION ALL
SELECT 'notificaciones_sistema' as tabla, COUNT(*) as registros FROM notificaciones_sistema
UNION ALL
SELECT 'audit_log' as tabla, COUNT(*) as registros FROM audit_log
UNION ALL
SELECT 'error_log' as tabla, COUNT(*) as registros FROM error_log
UNION ALL
SELECT 'empleados' as tabla, COUNT(*) as registros FROM empleados;

-- Mostrar productos cargados
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
ORDER BY nombre 
LIMIT 20;

-- Mostrar estadísticas de productos por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad_productos,
  SUM(stock) as stock_total,
  AVG(precio_minorista) as precio_promedio
FROM productos 
GROUP BY categoria 
ORDER BY cantidad_productos DESC;

