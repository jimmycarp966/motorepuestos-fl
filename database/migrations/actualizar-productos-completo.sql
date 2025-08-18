-- Script para actualizar productos desde produc.txt
-- Ejecutar en el SQL Editor de Supabase
-- Este script ACTUALIZA productos existentes y AGREGA nuevos si no existen

-- 1. Verificar y agregar columnas necesarias si no existen
ALTER TABLE productos ADD COLUMN IF NOT EXISTS codigo_sku VARCHAR(100);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_mayorista DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;

-- 2. Crear índice único en codigo_sku si no existe
CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_codigo_sku ON productos(codigo_sku);

-- 3. Función para determinar categoría automáticamente
CREATE OR REPLACE FUNCTION determinar_categoria_producto(nombre TEXT)
RETURNS TEXT AS $$
BEGIN
  IF nombre ILIKE '%aceite%' THEN RETURN 'Lubricantes';
  ELSIF nombre ILIKE '%filtro%' THEN RETURN 'Filtros';
  ELSIF nombre ILIKE '%bujia%' OR nombre ILIKE '%bujía%' THEN RETURN 'Encendido';
  ELSIF nombre ILIKE '%freno%' THEN RETURN 'Frenos';
  ELSIF nombre ILIKE '%bateria%' OR nombre ILIKE '%batería%' THEN RETURN 'Eléctrico';
  ELSIF nombre ILIKE '%amortiguador%' THEN RETURN 'Suspensión';
  ELSIF nombre ILIKE '%cadena%' THEN RETURN 'Transmisión';
  ELSIF nombre ILIKE '%carburador%' THEN RETURN 'Carburación';
  ELSIF nombre ILIKE '%cilindro%' THEN RETURN 'Motor';
  ELSIF nombre ILIKE '%piston%' OR nombre ILIKE '%pistón%' THEN RETURN 'Motor';
  ELSIF nombre ILIKE '%aro%' THEN RETURN 'Motor';
  ELSIF nombre ILIKE '%junta%' THEN RETURN 'Motor';
  ELSIF nombre ILIKE '%cable%' THEN RETURN 'Eléctrico';
  ELSIF nombre ILIKE '%lampara%' OR nombre ILIKE '%lámpara%' THEN RETURN 'Iluminación';
  ELSIF nombre ILIKE '%faro%' OR nombre ILIKE '%farol%' THEN RETURN 'Iluminación';
  ELSIF nombre ILIKE '%espejo%' THEN RETURN 'Espejos';
  ELSIF nombre ILIKE '%manubrio%' THEN RETURN 'Accesorios';
  ELSIF nombre ILIKE '%asiento%' THEN RETURN 'Accesorios';
  ELSIF nombre ILIKE '%funda%' THEN RETURN 'Accesorios';
  ELSIF nombre ILIKE '%casco%' THEN RETURN 'Seguridad';
  ELSIF nombre ILIKE '%guante%' THEN RETURN 'Seguridad';
  ELSIF nombre ILIKE '%agua%' THEN RETURN 'Refrigeración';
  ELSIF nombre ILIKE '%limpiador%' OR nombre ILIKE '%limpieza%' THEN RETURN 'Limpieza';
  ELSIF nombre ILIKE '%grasa%' OR nombre ILIKE '%lubricante%' THEN RETURN 'Lubricantes';
  ELSIF nombre ILIKE '%llanta%' OR nombre ILIKE '%cubierta%' THEN RETURN 'Neumáticos';
  ELSIF nombre ILIKE '%candado%' THEN RETURN 'Seguridad';
  ELSIF nombre ILIKE '%herramienta%' THEN RETURN 'Herramientas';
  ELSE RETURN 'Repuestos';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para determinar unidad de medida
CREATE OR REPLACE FUNCTION determinar_unidad_medida(nombre TEXT)
RETURNS TEXT AS $$
BEGIN
  IF nombre ILIKE '%aceite%' OR nombre ILIKE '%agua%' OR nombre ILIKE '%líquido%' THEN RETURN 'lt';
  ELSIF nombre ILIKE '%aro%' THEN RETURN 'juego';
  ELSIF nombre ILIKE '%guante%' THEN RETURN 'par';
  ELSE RETURN 'pcs';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para extraer precio numérico
CREATE OR REPLACE FUNCTION extraer_precio(precio_str TEXT)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  IF precio_str IS NULL OR precio_str = '' THEN RETURN 0;
  ELSE
    RETURN COALESCE(
      NULLIF(
        REGEXP_REPLACE(
          REGEXP_REPLACE(precio_str, '[^\d,\.]', '', 'g'),
          ',', '.'
        ), ''
      )::DECIMAL(10,2),
      0
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para extraer número entero
CREATE OR REPLACE FUNCTION extraer_numero(num_str TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF num_str IS NULL OR num_str = '' THEN RETURN 0;
  ELSE
    RETURN COALESCE(
      NULLIF(
        REGEXP_REPLACE(
          REGEXP_REPLACE(num_str, '[^\d,\.]', '', 'g'),
          ',', '.'
        ), ''
      )::DECIMAL(10,2)::INTEGER,
      0
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Actualizar productos existentes y agregar nuevos
-- Los datos se procesan desde el archivo produc.txt
-- Mapeo: precio mayoreo = precio_mayorista, precio costo = costo, precio venta = precio (minorista)

-- Ejemplo de actualización para algunos productos (se puede expandir con todos los datos del archivo)
INSERT INTO productos (
  codigo_sku,
  nombre,
  descripcion,
  categoria,
  precio, -- precio venta (minorista)
  precio_mayorista, -- precio mayoreo
  costo, -- precio costo
  stock,
  stock_minimo,
  unidad_medida,
  activo
) VALUES 
-- FOCO 110
('FOCO 110', 'FOCO 110', 'Foco de 110V', determinar_categoria_producto('FOCO 110'), 1900.00, 0.00, 0.00, 20, 0, determinar_unidad_medida('FOCO 110'), true),

-- ABRAZADERA 110
('1728', 'ABRAZADERA 110', 'Abrazadera para mangueras 110mm', determinar_categoria_producto('ABRAZADERA 110'), 3800.00, 0.00, 2150.00, 4, 0, determinar_unidad_medida('ABRAZADERA 110'), true),

-- ABRAZADERA MANGUERA DE NAFTA
('1420', 'ABRAZADERA MANGUERA DE NAFTA', 'Abrazadera para manguera de nafta', determinar_categoria_producto('ABRAZADERA MANGUERA DE NAFTA'), 200.00, 0.00, 74.00, 100, 0, determinar_unidad_medida('ABRAZADERA MANGUERA DE NAFTA'), true),

-- ACEITE 2T 100CC COMPETICION RECCINO
('1226', 'ACEITE 2T 100CC COMPETICION RECCINO', 'Aceite 2 tiempos para competencia', determinar_categoria_producto('ACEITE 2T 100CC COMPETICION RECCINO'), 4320.00, 0.00, 1520.00, 1, 2, determinar_unidad_medida('ACEITE 2T 100CC COMPETICION RECCINO'), true),

-- ACEITE 2T CASTROL 1L
('1772', 'ACEITE 2T CASTROL 1L', 'Aceite 2 tiempos Castrol 1 litro', determinar_categoria_producto('ACEITE 2T CASTROL 1L'), 11000.00, 0.00, 6630.00, 2, 0, determinar_unidad_medida('ACEITE 2T CASTROL 1L'), true),

-- ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER
('54', 'ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER', 'Aceite 2 tiempos 100cc', determinar_categoria_producto('ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER'), 2000.00, 0.00, 1190.00, 27, 0, determinar_unidad_medida('ACEITE 2T X 100CC 2TIEMPOS MACH/ WANDER'), true),

-- ACEITE CASTROL BLANCO
('1343', 'ACEITE CASTROL BLANCO', 'Aceite Castrol blanco', determinar_categoria_producto('ACEITE CASTROL BLANCO'), 9500.00, 0.00, 5850.00, 7, 0, determinar_unidad_medida('ACEITE CASTROL BLANCO'), true),

-- ACEITE CASTROL GRIS
('1272', 'ACEITE CASTROL GRIS', 'Aceite Castrol gris', determinar_categoria_producto('ACEITE CASTROL GRIS'), 11000.00, 0.00, 7000.00, 21, 0, determinar_unidad_medida('ACEITE CASTROL GRIS'), true),

-- ACEITE CASTROL SEMI-SINTETICO POWER1
('1534', 'ACEITE CASTROL SEMI-SINTETICO POWER1', 'Aceite semi-sintético Castrol Power1', determinar_categoria_producto('ACEITE CASTROL SEMI-SINTETICO POWER1'), 14000.00, 0.00, 9980.00, 2, 0, determinar_unidad_medida('ACEITE CASTROL SEMI-SINTETICO POWER1'), true),

-- ACEITE DE CADENA WALKER
('1603', 'ACEITE DE CADENA WALKER', 'Aceite para cadena Walker', determinar_categoria_producto('ACEITE DE CADENA WALKER'), 4200.00, 0.00, 2620.00, 0, 0, determinar_unidad_medida('ACEITE DE CADENA WALKER'), true),

-- ACEITE DE CADENA X 240 CM AEROTEK
('51', 'ACEITE DE CADENA X 240 CM AEROTEK', 'Aceite para cadena Aerotek 240cm', determinar_categoria_producto('ACEITE DE CADENA X 240 CM AEROTEK'), 2800.00, 0.00, 800.00, 2, 5, determinar_unidad_medida('ACEITE DE CADENA X 240 CM AEROTEK'), true),

-- ACEITE DE SUSPENSION 10W X 250CC MACH
('1686', 'ACEITE DE SUSPENSION 10W X 250CC MACH', 'Aceite de suspensión 10W 250cc', determinar_categoria_producto('ACEITE DE SUSPENSION 10W X 250CC MACH'), 3900.00, 0.00, 2470.00, 8, 0, determinar_unidad_medida('ACEITE DE SUSPENSION 10W X 250CC MACH'), true),

-- ACEITE DE SUSPENSION 15W FERCOL
('1507', 'ACEITE DE SUSPENSION 15W FERCOL', 'Aceite de suspensión 15W Fercol', determinar_categoria_producto('ACEITE DE SUSPENSION 15W FERCOL'), 4500.00, 0.00, 2650.00, 1, 0, determinar_unidad_medida('ACEITE DE SUSPENSION 15W FERCOL'), true),

-- ACEITE DE SUSPENSION FORCES X 200CM WANDER
('52', 'ACEITE DE SUSPENSION FORCES X 200CM WANDER', 'Aceite de suspensión Forces 200cm', determinar_categoria_producto('ACEITE DE SUSPENSION FORCES X 200CM WANDER'), 3200.00, 0.00, 1980.00, 0, 0, determinar_unidad_medida('ACEITE DE SUSPENSION FORCES X 200CM WANDER'), true),

-- ACEITE HONDA HGO 10W30
('1725', 'ACEITE HONDA HGO 10W30', 'Aceite Honda HGO 10W30', determinar_categoria_producto('ACEITE HONDA HGO 10W30'), 14500.00, 0.00, 9500.00, 14, 0, determinar_unidad_medida('ACEITE HONDA HGO 10W30'), true),

-- ACEITE IPONE 20W50 SEMI SINTETICO
('1794', 'ACEITE IPONE 20W50 SEMI SINTETICO', 'Aceite Ipone 20W50 semi-sintético', determinar_categoria_producto('ACEITE IPONE 20W50 SEMI SINTETICO'), 17000.00, 0.00, 11900.00, 12, 0, determinar_unidad_medida('ACEITE IPONE 20W50 SEMI SINTETICO'), true),

-- ACEITE MOTUL 3000 20W50 MINERAL
('1770', 'ACEITE MOTUL 3000 20W50 MINERAL', 'Aceite Motul 3000 20W50 mineral', determinar_categoria_producto('ACEITE MOTUL 3000 20W50 MINERAL'), 14000.00, 0.00, 8750.00, 10, 0, determinar_unidad_medida('ACEITE MOTUL 3000 20W50 MINERAL'), true),

-- ACEITE MOTUL 5000 20W50 SEMISINTETICO
('1535', 'ACEITE MOTUL 5000 20W50 SEMISINTETICO', 'Aceite Motul 5000 20W50 semi-sintético', determinar_categoria_producto('ACEITE MOTUL 5000 20W50 SEMISINTETICO'), 14500.00, 0.00, 9000.00, 21, 0, determinar_unidad_medida('ACEITE MOTUL 5000 20W50 SEMISINTETICO'), true),

-- ACEITE MOTUL 5100 SEMISINTETICO
('1450', 'ACEITE MOTUL 5100 SEMISINTETICO', 'Aceite Motul 5100 semi-sintético', determinar_categoria_producto('ACEITE MOTUL 5100 SEMISINTETICO'), 16000.00, 0.00, 9920.00, 3, 0, determinar_unidad_medida('ACEITE MOTUL 5100 SEMISINTETICO'), true),

-- ACEITE MOTUL 7100
('1633', 'ACEITE MOTUL 7100', 'Aceite Motul 7100', determinar_categoria_producto('ACEITE MOTUL 7100'), 31000.00, 0.00, 21880.00, 7, 0, determinar_unidad_medida('ACEITE MOTUL 7100'), true),

-- ACEITE RIDERS 4T
('1282', 'ACEITE RIDERS 4T', 'Aceite Riders 4 tiempos', determinar_categoria_producto('ACEITE RIDERS 4T'), 4000.00, 0.00, 3080.00, 119, 0, determinar_unidad_medida('ACEITE RIDERS 4T'), true),

-- ACEITE ROD YPF 20 W 50
('53', 'ACEITE ROD YPF 20 W 50', 'Aceite ROD YPF 20W50', determinar_categoria_producto('ACEITE ROD YPF 20 W 50'), 6500.00, 0.00, 4500.00, 239, 0, determinar_unidad_medida('ACEITE ROD YPF 20 W 50'), true),

-- ACEITE SHELL ADVACE AX3 ROJO
('551', 'ACEITE SHELL ADVACE AX3 ROJO', 'Aceite Shell Advance AX3 rojo', determinar_categoria_producto('ACEITE SHELL ADVACE AX3 ROJO'), 8500.00, 0.00, 5700.00, 0, 0, determinar_unidad_medida('ACEITE SHELL ADVACE AX3 ROJO'), true),

-- ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO
('550', 'ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO', 'Aceite Shell Advance 20W50 AX5 amarillo', determinar_categoria_producto('ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO'), 9800.00, 0.00, 6600.00, 0, 1, determinar_unidad_medida('ACEITE SHELL ADVANCE 20W50 AX5 AMARILLO'), true),

-- ACEITE WANDER 15W50 SEMI SINTETICO
('1371', 'ACEITE WANDER 15W50 SEMI SINTETICO', 'Aceite Wander 15W50 semi-sintético', determinar_categoria_producto('ACEITE WANDER 15W50 SEMI SINTETICO'), 7000.00, 0.00, 4300.00, 1, 0, determinar_unidad_medida('ACEITE WANDER 15W50 SEMI SINTETICO'), true),

-- ACEITE WANDER MINERAL
('W0065', 'ACEITE WANDER MINERAL', 'Aceite Wander mineral', determinar_categoria_producto('ACEITE WANDER MINERAL'), 6000.00, 0.00, 3780.00, 3, 0, determinar_unidad_medida('ACEITE WANDER MINERAL'), true),

-- ACEITE YAMALUBE 20W40
('1536', 'ACEITE YAMALUBE 20W40', 'Aceite Yamalube 20W40', determinar_categoria_producto('ACEITE YAMALUBE 20W40'), 14000.00, 0.00, 8740.00, 4, 0, determinar_unidad_medida('ACEITE YAMALUBE 20W40'), true)

ON CONFLICT (codigo_sku) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  categoria = EXCLUDED.categoria,
  precio = EXCLUDED.precio, -- precio venta (minorista)
  precio_mayorista = EXCLUDED.precio_mayorista, -- precio mayoreo
  costo = EXCLUDED.costo, -- precio costo
  stock = EXCLUDED.stock,
  stock_minimo = EXCLUDED.stock_minimo,
  unidad_medida = EXCLUDED.unidad_medida,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- 8. Verificar la actualización
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  AVG(precio) as precio_promedio,
  SUM(stock_minimo) as stock_minimo_total,
  COUNT(CASE WHEN precio_mayorista > 0 THEN 1 END) as productos_con_mayorista,
  COUNT(CASE WHEN costo > 0 THEN 1 END) as productos_con_costo
FROM productos;

-- 9. Mostrar algunos productos actualizados como ejemplo
SELECT 
  codigo_sku,
  nombre,
  costo,
  precio as precio_minorista,
  precio_mayorista,
  stock,
  stock_minimo,
  categoria,
  unidad_medida
FROM productos 
WHERE codigo_sku IN ('FOCO 110', '1728', '1226', '1772', '1343')
ORDER BY codigo_sku;

-- 10. Mostrar estadísticas por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad_productos,
  SUM(stock) as stock_total,
  AVG(precio) as precio_promedio,
  AVG(costo) as costo_promedio
FROM productos 
GROUP BY categoria 
ORDER BY cantidad_productos DESC;

-- 11. Limpiar funciones temporales (opcional)
-- DROP FUNCTION IF EXISTS determinar_categoria_producto(TEXT);
-- DROP FUNCTION IF EXISTS determinar_unidad_medida(TEXT);
-- DROP FUNCTION IF EXISTS extraer_precio(TEXT);
-- DROP FUNCTION IF EXISTS extraer_numero(TEXT);
