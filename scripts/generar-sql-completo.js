import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo produc.txt
const filePath = path.join(__dirname, '../produc.txt');
const content = fs.readFileSync(filePath, 'utf8');

// Procesar las líneas
const lines = content.split('\n').filter(line => line.trim());

// Obtener las columnas del header
const header = lines[0].split('\t');
console.log('Columnas detectadas:', header);

// Procesar los productos (saltar la primera línea que es el header)
const productos = lines.slice(1).map(line => {
  const columns = line.split('\t');
  
  // Extraer los datos según las columnas
  const codigo = columns[0]?.trim() || '';
  const descripcion = columns[1]?.trim() || '';
  const precioCosto = parseFloat(columns[2]?.replace('$', '').replace(',', '') || '0');
  const precioVenta = parseFloat(columns[3]?.replace('$', '').replace(',', '') || '0');
  const precioMayoreo = parseFloat(columns[4]?.replace('$', '').replace(',', '') || '0');
  const inventario = parseFloat(columns[5]?.replace(',', '') || '0');
  const invMinimo = parseFloat(columns[6]?.replace(',', '') || '0');
  const departamento = columns[7]?.trim() || 'Sin Departamento';

  return {
    codigo,
    descripcion,
    precioCosto,
    precioVenta,
    precioMayoreo,
    inventario,
    invMinimo,
    departamento
  };
});

// Generar el SQL completo
let sql = `-- Script para limpiar todas las tablas y cargar productos desde produc.txt
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

INSERT INTO productos (sku, nombre, descripcion, precio_costo, precio_venta, precio_mayoreo, stock_actual, stock_minimo, categoria, activo, created_at, updated_at) VALUES\n`;

productos.forEach((producto, index) => {
  const isLast = index === productos.length - 1;
  const comma = isLast ? ';' : ',';
  
  sql += `('${producto.codigo.replace(/'/g, "''")}', '${producto.descripcion.replace(/'/g, "''")}', '${producto.descripcion.replace(/'/g, "''")}', ${producto.precioCosto}, ${producto.precioVenta}, ${producto.precioMayoreo}, ${producto.inventario}, ${producto.invMinimo}, '${producto.departamento.replace(/'/g, "''")}', true, NOW(), NOW())${comma}\n`;
});

// Agregar comentarios finales
sql += `
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

-- Total de productos cargados: ${productos.length}
`;

// Guardar el archivo SQL
const outputPath = path.join(__dirname, '../database/migrations/limpiar-y-cargar-productos-completo.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ Procesados ${productos.length} productos`);
console.log(`✅ Archivo SQL generado: ${outputPath}`);

// Mostrar algunos ejemplos
console.log('\n📋 Ejemplos de productos procesados:');
productos.slice(0, 5).forEach((producto, index) => {
  console.log(`${index + 1}. ${producto.codigo} - ${producto.descripcion} - $${producto.precioVenta}`);
});

// Mostrar estadísticas
const categorias = {};
productos.forEach(producto => {
  if (!categorias[producto.departamento]) {
    categorias[producto.departamento] = 0;
  }
  categorias[producto.departamento]++;
});

console.log('\n📊 Estadísticas por categoría:');
Object.entries(categorias).forEach(([categoria, cantidad]) => {
  console.log(`${categoria}: ${cantidad} productos`);
});
