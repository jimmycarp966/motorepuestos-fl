-- Script para limpiar todas las tablas y cargar productos desde produc.txt
-- Este script elimina todos los datos excepto empleados y carga los productos
-- Basado en el archivo cargar-productos-completo-1435.sql que ya funciona

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
-- Usando la estructura que ya funciona del archivo cargar-productos-completo-1435.sql

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

-- 2. Insertar datos en tabla temporal
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
('1359', 'AGUA DESMINERALIZADA 5L MATCH', 'AGUA DESMINERALIZADA 5L MATCH', 'Repuestos', 4000, 0, 2450, 0, 0, 'UNIDAD', true);

-- 3. Insertar productos desde la tabla temporal a la tabla real
INSERT INTO productos (
  sku, 
  nombre, 
  descripcion, 
  precio_costo, 
  precio_venta, 
  precio_mayoreo, 
  stock_actual, 
  stock_minimo, 
  categoria, 
  activo, 
  created_at, 
  updated_at
)
SELECT 
  codigo_sku,
  nombre,
  descripcion,
  costo,
  precio_minorista,
  precio_mayorista,
  stock,
  stock_minimo,
  categoria,
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
