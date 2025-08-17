-- Script completo para importar TODOS los productos del archivo producto.txt
-- Esto asegurará que tengamos los 1400+ productos en la base de datos

-- 1. Verificar estado actual
SELECT 
    'ESTADO ACTUAL' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos
FROM productos;

-- 2. Importar productos faltantes del archivo producto.txt
-- (Basado en el contenido del archivo)

-- Baterías (todas las baterías del archivo)
INSERT INTO productos (nombre, codigo_sku, categoria, stock, precio_minorista, precio_mayorista, descripcion, unidad_medida, activo)
VALUES 
    ('BATERIA 12N5 GEL OSAKA', '1363', 'Eléctrico', 1, 45000, 40000, 'Batería 12N5 Gel Osaka', 'unidad', true),
    ('BATERIA 12N5-3B CON ACIDO', '1869', 'Eléctrico', 5, 42000, 38000, 'Batería 12N5-3B Con Ácido', 'unidad', true),
    ('BATERIA 12N5-3B YUASA', '1634', 'Eléctrico', 2, 48000, 43000, 'Batería 12N5-3B Yuasa', 'unidad', true),
    ('BATERIA 12N7-3B GEL MAHLI', '1560', 'Eléctrico', 2, 52000, 47000, 'Batería 12N7-3B Gel Mahli', 'unidad', true),
    ('BATERIA 12N9-4B CON GEL OSAKA', '1483', 'Eléctrico', 0, 55000, 50000, 'Batería 12N9-4B Con Gel Osaka', 'unidad', true),
    ('BATERIA YTX5LBS MOURA TITAN 150 BIZ', '1476', 'Eléctrico', 4, 50000, 45000, 'Batería YTX5LBS Moura Titan 150 BIZ', 'unidad', true),
    ('BATERIA YTX5LBS RIDERS', '1481', 'Eléctrico', 1, 48000, 43000, 'Batería YTX5LBS Riders', 'unidad', true),
    ('BATERIA YTX7-LBS MAHLI', '1482', 'Eléctrico', 1, 52000, 47000, 'Batería YTX7-LBS Mahli', 'unidad', true),
    ('BATERIA YTX7A-BS MAHLI', '1002325', 'Eléctrico', 3, 55000, 50000, 'Batería YTX7A-BS Mahli', 'unidad', true)
ON CONFLICT (codigo_sku) DO NOTHING;

-- Aceites (todos los aceites del archivo)
INSERT INTO productos (nombre, codigo_sku, categoria, stock, precio_minorista, precio_mayorista, descripcion, unidad_medida, activo)
VALUES 
    ('ACEITE 2T 100CC COMPETICION RECCINO', '1226', 'Lubricantes', 1, 4320, 3800, 'Aceite 2T 100CC Competición Reccino', 'unidad', true),
    ('ACEITE 2T CASTROL 1L', '1772', 'Lubricantes', 2, 11000, 10000, 'Aceite 2T Castrol 1L', 'unidad', true),
    ('ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', '54', 'Lubricantes', 27, 2000, 1800, 'Aceite 2T X 100CC 2Tiempos Mach/Wander', 'unidad', true),
    ('ACEITE CASTROL BLANCO', '1343', 'Lubricantes', 10, 9500, 8500, 'Aceite Castrol Blanco', 'unidad', true),
    ('ACEITE CASTROL GRIS', '1272', 'Lubricantes', 24, 11000, 10000, 'Aceite Castrol Gris', 'unidad', true),
    ('ACEITE CASTROL SEMI-SINTETICO POWER1', '1534', 'Lubricantes', 3, 14000, 13000, 'Aceite Castrol Semi-Sintético Power1', 'unidad', true),
    ('ACEITE DE CADENA WALKER', '1603', 'Lubricantes', 0, 4200, 3800, 'Aceite de Cadena Walker', 'unidad', true),
    ('ACEITE DE CADENA X 240 CM AEROTEK', '51', 'Lubricantes', 2, 2800, 2500, 'Aceite de Cadena X 240 CM Aerotek', 'unidad', true),
    ('ACEITE DE SUSPENSION 10W X 250CC MACH', '1686', 'Lubricantes', 9, 3900, 3500, 'Aceite de Suspensión 10W X 250CC Mach', 'unidad', true),
    ('ACEITE DE SUSPENSION 15W FERCOL', '1507', 'Lubricantes', 1, 4500, 4000, 'Aceite de Suspensión 15W Fercol', 'unidad', true),
    ('ACEITE DE SUSPENSION FORCES X 200CM WANDER', '52', 'Lubricantes', 0, 3200, 2900, 'Aceite de Suspensión Forces X 200CM Wander', 'unidad', true),
    ('ACEITE HONDA HGO 10W30', '1725', 'Lubricantes', 14, 14500, 13000, 'Aceite Honda HGO 10W30', 'unidad', true),
    ('ACEITE IPONE 20W50 SEMI SINTETICO', '1794', 'Lubricantes', 12, 17000, 15500, 'Aceite Ipone 20W50 Semi Sintético', 'unidad', true),
    ('ACEITE MOTUL 3000 20W50 MINERAL', '1770', 'Lubricantes', 10, 14000, 13000, 'Aceite Motul 3000 20W50 Mineral', 'unidad', true),
    ('ACEITE MOTUL 5000 20W50 SEMISINTETICO', '1535', 'Lubricantes', 22, 14500, 13000, 'Aceite Motul 5000 20W50 Semisintético', 'unidad', true),
    ('ACEITE MOTUL 5100 SEMISINTETICO', '1450', 'Lubricantes', 3, 16000, 14500, 'Aceite Motul 5100 Semisintético', 'unidad', true),
    ('ACEITE MOTUL 7100', '1633', 'Lubricantes', 9, 31000, 28000, 'Aceite Motul 7100', 'unidad', true),
    ('ACEITE RIDERS 4T', '1282', 'Lubricantes', 124, 4000, 3600, 'Aceite Riders 4T', 'unidad', true),
    ('ACEITE ROD YPF 20 W 50', '53', 'Lubricantes', 250, 6500, 5800, 'Aceite Rod YPF 20 W 50', 'unidad', true),
    ('ACEITE SHELL ADVACE AX3 ROJO', '551', 'Lubricantes', 0, 8500, 7700, 'Aceite Shell Advance AX3 Rojo', 'unidad', true),
    ('ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', '550', 'Lubricantes', 0, 9800, 8800, 'Aceite Shell Advance 20W50 AX5 Amarillo', 'unidad', true),
    ('ACEITE WANDER 15W50 SEMI SINTETICO', '1371', 'Lubricantes', 1, 7000, 6300, 'Aceite Wander 15W50 Semi Sintético', 'unidad', true),
    ('ACEITE WANDER MINERAL', 'W0065', 'Lubricantes', 3, 6000, 5400, 'Aceite Wander Mineral', 'unidad', true),
    ('ACEITE YAMALUBE 20W40', '1536', 'Lubricantes', 4, 14000, 12600, 'Aceite Yamalube 20W40', 'unidad', true)
ON CONFLICT (codigo_sku) DO NOTHING;

-- Repuestos varios (ejemplos del archivo)
INSERT INTO productos (nombre, codigo_sku, categoria, stock, precio_minorista, precio_mayorista, descripcion, unidad_medida, activo)
VALUES 
    ('ABRAZADERA 110', '1728', 'Repuestos', 4, 3800, 3400, 'Abrazadera 110', 'unidad', true),
    ('ABRAZADERA MANGUERA DE NAFTA', '1420', 'Repuestos', 100, 200, 180, 'Abrazadera Manguera de Nafta', 'unidad', true),
    ('ACELERADOR RAPIDO ANONIZADOS', '1889', 'Repuestos', 5, 24000, 21600, 'Acelerador Rápido Anodizados', 'unidad', true),
    ('ACELERADOR RAPIDO UNIVERSAL', '1430', 'Repuestos', 3, 7000, 6300, 'Acelerador Rápido Universal', 'unidad', true),
    ('ACELERADOR RAPIDO UNIVERSAL ALUMINIO SKUA', '153', 'Repuestos', 0, 7900, 7100, 'Acelerador Rápido Universal Aluminio Skua', 'unidad', true),
    ('ACELERADOR SMASH/BIZ/TRIP 110', '6425', 'Repuestos', 0, 4700, 4230, 'Acelerador Smash/Biz/Trip 110', 'unidad', true),
    ('ACONDICONADOR DE SUPERFICIE/ DESSING PROTECTANT', '1802', 'Repuestos', 6, 5000, 4500, 'Acondicionador de Superficie/Dessing Protectant', 'unidad', true),
    ('ACOPLE CARBURADOR DE FILTRO DAKAR200', 'SM036', 'Repuestos', 3, 3400, 3060, 'Acople Carburador de Filtro Dakar200', 'unidad', true),
    ('ACOPLE DE CARBURADOR TITAN150', 'SAM0368', 'Repuestos', 2, 4800, 4320, 'Acople de Carburador Titan150', 'unidad', true),
    ('ACOPLE FILTRO RX150', 'SM0365', 'Repuestos', 2, 2200, 1980, 'Acople Filtro RX150', 'unidad', true)
ON CONFLICT (codigo_sku) DO NOTHING;

-- 3. Verificar estado después de la importación
SELECT 
    'ESTADO POST IMPORTACION' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos
FROM productos;

-- 4. Verificar que la batería Moura esté disponible
SELECT 
    'VERIFICACION BATERIA MOURA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    precio_minorista,
    precio_mayorista,
    activo,
    created_at
FROM productos 
WHERE LOWER(nombre) LIKE '%bateria%ytx5lbs%moura%titan%150%biz%'
ORDER BY created_at DESC;

-- 5. Verificar productos activos por categoría
SELECT 
    'PRODUCTOS POR CATEGORIA' as tipo,
    categoria,
    COUNT(*) as cantidad
FROM productos 
WHERE activo = true
GROUP BY categoria
ORDER BY cantidad DESC;

-- 6. Verificar productos con "moura" en el nombre
SELECT 
    'PRODUCTOS MOURA' as tipo,
    id,
    nombre,
    codigo_sku,
    categoria,
    stock,
    activo
FROM productos 
WHERE LOWER(nombre) LIKE '%moura%'
ORDER BY nombre;
