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

// Generar el SQL
let sql = `-- Script para cargar productos desde produc.txt
-- Primero limpiar la tabla de productos existente
DELETE FROM productos;

-- Resetear la secuencia de IDs
ALTER SEQUENCE productos_id_seq RESTART WITH 1;

-- Insertar productos desde produc.txt
-- Estructura: Codigo, Descripcion, Precio Costo, Precio Venta, Precio Mayoreo, Inventario, Inv. Minimo, Departamento

INSERT INTO productos (sku, nombre, descripcion, precio_costo, precio_venta, precio_mayoreo, stock_actual, stock_minimo, categoria, activo, created_at, updated_at) VALUES\n`;

productos.forEach((producto, index) => {
  const isLast = index === productos.length - 1;
  const comma = isLast ? ';' : ',';
  
  sql += `('${producto.codigo.replace(/'/g, "''")}', '${producto.descripcion.replace(/'/g, "''")}', '${producto.descripcion.replace(/'/g, "''")}', ${producto.precioCosto}, ${producto.precioVenta}, ${producto.precioMayoreo}, ${producto.inventario}, ${producto.invMinimo}, '${producto.departamento.replace(/'/g, "''")}', true, NOW(), NOW())${comma}\n`;
});

// Agregar comentarios finales
sql += `
-- Total de productos cargados: ${productos.length}
-- Verificar la carga de datos
SELECT 
  COUNT(*) as total_productos,
  SUM(stock_actual) as stock_total,
  AVG(precio_venta) as precio_promedio,
  SUM(stock_minimo) as stock_minimo_total
FROM productos;

-- Mostrar algunos productos como ejemplo
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
ORDER BY created_at 
LIMIT 10;

-- Mostrar estadísticas por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad_productos,
  SUM(stock_actual) as stock_total,
  AVG(precio_venta) as precio_promedio
FROM productos 
GROUP BY categoria 
ORDER BY cantidad_productos DESC;
`;

// Guardar el archivo SQL
const outputPath = path.join(__dirname, '../database/migrations/cargar-productos-completo.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ Procesados ${productos.length} productos`);
console.log(`✅ Archivo SQL generado: ${outputPath}`);

// Mostrar algunos ejemplos
console.log('\n📋 Ejemplos de productos procesados:');
productos.slice(0, 5).forEach((producto, index) => {
  console.log(`${index + 1}. ${producto.codigo} - ${producto.descripcion} - $${producto.precioVenta}`);
});
