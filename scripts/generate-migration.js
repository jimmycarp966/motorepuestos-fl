import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo produc.txt
const productoPath = path.join(__dirname, '..', 'produc.txt');
const contenido = fs.readFileSync(productoPath, 'utf8');

// Procesar las líneas
const lineas = contenido.split('\n').filter(linea => linea.trim());

// Función para limpiar y procesar valores
function limpiarValor(valor) {
  if (!valor) return '';
  return valor.trim().replace(/\s+/g, ' ');
}

// Función para extraer precio numérico
function extraerPrecio(precioStr) {
  if (!precioStr) return 0;
  const match = precioStr.match(/\$?([0-9,]+\.[0-9]*)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}

// Función para determinar categoría basada en el nombre
function determinarCategoria(nombre) {
  const nombreUpper = nombre.toUpperCase();
  
  if (nombreUpper.includes('ACEITE') || nombreUpper.includes('LUBRICANTE')) return 'Lubricantes';
  if (nombreUpper.includes('FILTRO')) return 'Filtros';
  if (nombreUpper.includes('FRENO') || nombreUpper.includes('ZAPATA')) return 'Frenos';
  if (nombreUpper.includes('MOTOR') || nombreUpper.includes('CILINDRO') || nombreUpper.includes('PISTON')) return 'Motor';
  if (nombreUpper.includes('TRANSMISION') || nombreUpper.includes('ENGRANAJE') || nombreUpper.includes('CADENA')) return 'Transmisión';
  if (nombreUpper.includes('ELECTRICO') || nombreUpper.includes('BATERIA') || nombreUpper.includes('BOMBILLA')) return 'Eléctrico';
  if (nombreUpper.includes('NEUMATICO') || nombreUpper.includes('LLANTA')) return 'Neumáticos';
  if (nombreUpper.includes('CARBURADOR') || nombreUpper.includes('INYECTOR')) return 'Carburación';
  if (nombreUpper.includes('ENCENDIDO') || nombreUpper.includes('BUJIA')) return 'Encendido';
  if (nombreUpper.includes('ILUMINACION') || nombreUpper.includes('LUCES')) return 'Iluminación';
  if (nombreUpper.includes('ACCESORIO') || nombreUpper.includes('CASCO') || nombreUpper.includes('GUANTE')) return 'Accesorios';
  
  return 'Repuestos';
}

// Función para determinar unidad de medida
function determinarUnidadMedida(nombre) {
  const nombreUpper = nombre.toUpperCase();
  
  if (nombreUpper.includes('ACEITE') || nombreUpper.includes('LUBRICANTE')) return 'LITRO';
  if (nombreUpper.includes('NEUMATICO') || nombreUpper.includes('LLANTA')) return 'UNIDAD';
  if (nombreUpper.includes('FILTRO')) return 'UNIDAD';
  if (nombreUpper.includes('BATERIA')) return 'UNIDAD';
  if (nombreUpper.includes('CASCO')) return 'UNIDAD';
  if (nombreUpper.includes('GUANTE')) return 'PAR';
  if (nombreUpper.includes('CADENA')) return 'UNIDAD';
  if (nombreUpper.includes('BOMBILLA')) return 'UNIDAD';
  
  return 'UNIDAD';
}

// Procesar productos
const productos = [];
const categorias = {};

lineas.forEach((linea, index) => {
  if (index === 0) return; // Saltar encabezado
  
  const columnas = linea.split('\t');
  if (columnas.length < 7) return;
  
  const codigo = limpiarValor(columnas[0]);
  const nombre = limpiarValor(columnas[1]);
  const precioCosto = extraerPrecio(columnas[2]);
  const precioVenta = extraerPrecio(columnas[3]);
  const precioMayoreo = extraerPrecio(columnas[4]);
  const inventario = parseInt(columnas[5]) || 0;
  const invMinimo = parseInt(columnas[6]) || 0;
  
  if (!codigo || !nombre) return;
  
  const categoria = determinarCategoria(nombre);
  const unidadMedida = determinarUnidadMedida(nombre);
  
  // Contar categorías
  categorias[categoria] = (categorias[categoria] || 0) + 1;
  
  productos.push({
    codigo_sku: codigo,
    nombre: nombre,
    descripcion: nombre,
    categoria: categoria,
    precio_minorista: precioVenta,
    precio_mayorista: precioMayoreo,
    costo: precioCosto,
    stock: inventario,
    stock_minimo: invMinimo,
    unidad_medida: unidadMedida,
    activo: true
  });
});

// Generar SQL con sintaxis corregida
let sql = `-- Script para actualizar productos desde produc.txt - VERSIÓN FINAL
-- Ejecutar en el SQL Editor de Supabase
-- Este script ACTUALIZA productos existentes y AGREGA nuevos si no existen

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
`;

// Agregar productos al SQL
productos.forEach((producto, index) => {
  const isLast = index === productos.length - 1;
  sql += `('${producto.codigo_sku}', '${producto.nombre.replace(/'/g, "''")}', '${producto.descripcion.replace(/'/g, "''")}', '${producto.categoria}', ${producto.precio_minorista}, ${producto.precio_mayorista}, ${producto.costo}, ${producto.stock}, ${producto.stock_minimo}, '${producto.unidad_medida}', ${producto.activo})${isLast ? ';' : ','}\n`;
});

sql += `
-- 3. Actualizar productos existentes
UPDATE productos 
SET 
  nombre = pt.nombre,
  descripcion = pt.descripcion,
  categoria = pt.categoria,
  precio_minorista = pt.precio_minorista,
  precio_mayorista = pt.precio_mayorista,
  costo = pt.costo,
  stock = pt.stock,
  stock_minimo = pt.stock_minimo,
  unidad_medida = pt.unidad_medida,
  activo = pt.activo,
  updated_at = NOW()
FROM productos_temp pt
WHERE productos.codigo_sku = pt.codigo_sku;

-- 4. Insertar productos nuevos
INSERT INTO productos (
  codigo_sku, nombre, descripcion, categoria, 
  precio_minorista, precio_mayorista, costo, stock, stock_minimo, unidad_medida, activo
)
SELECT 
  pt.codigo_sku, pt.nombre, pt.descripcion, pt.categoria, 
  pt.precio_minorista, pt.precio_mayorista, pt.costo, pt.stock, pt.stock_minimo, 
  pt.unidad_medida, pt.activo
FROM productos_temp pt
LEFT JOIN productos p ON p.codigo_sku = pt.codigo_sku
WHERE p.codigo_sku IS NULL;

-- 5. Verificar la actualización
SELECT 
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  AVG(precio_minorista) as precio_promedio,
  SUM(stock_minimo) as stock_minimo_total,
  COUNT(CASE WHEN precio_mayorista > 0 THEN 1 END) as productos_con_mayorista,
  COUNT(CASE WHEN costo > 0 THEN 1 END) as productos_con_costo
FROM productos;

-- 6. Mostrar algunos productos actualizados como ejemplo
SELECT 
  codigo_sku,
  nombre,
  costo,
  precio_minorista,
  precio_mayorista,
  stock,
  stock_minimo,
  categoria,
  unidad_medida
FROM productos 
ORDER BY created_at 
LIMIT 10;

-- 7. Mostrar estadísticas por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad_productos,
  SUM(stock) as stock_total,
  AVG(precio_minorista) as precio_promedio,
  AVG(costo) as costo_promedio
FROM productos 
GROUP BY categoria 
ORDER BY cantidad_productos DESC;

-- 8. Limpiar tabla temporal
DROP TABLE productos_temp;
`;

// Escribir archivo SQL
const outputPath = path.join(__dirname, '..', 'cargar-productos-completo-1435.sql');
fs.writeFileSync(outputPath, sql);

// Mostrar estadísticas
console.log(`✅ Script SQL generado exitosamente: ${outputPath}`);
console.log(`📊 Total de productos procesados: ${productos.length}`);
console.log(`📈 Estadísticas por categoría:`);

Object.entries(categorias)
  .sort(([,a], [,b]) => b - a)
  .forEach(([categoria, cantidad]) => {
    console.log(`  - ${categoria}: ${cantidad} productos`);
  });

console.log(`\n🎯 Funcionalidades del script:`);
console.log(`  ✅ Actualiza productos existentes por SKU`);
console.log(`  ✅ Agrega productos nuevos si no existen`);
console.log(`  ✅ Mapea correctamente: precio mayoreo → precio_mayorista`);
console.log(`  ✅ Mapea correctamente: precio costo → costo`);
console.log(`  ✅ Mapea correctamente: precio venta → precio_minorista`);
console.log(`  ✅ Incluye stock y stock mínimo`);
console.log(`  ✅ Categorización automática por nombre`);
console.log(`  ✅ Unidades de medida automáticas`);

console.log(`\n📝 Para ejecutar:`);
console.log(`  1. Abrir SQL Editor en Supabase`);
console.log(`  2. Copiar y pegar el contenido del archivo generado`);
console.log(`  3. Ejecutar el script completo`);
