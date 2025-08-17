import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo producto.txt
const productoPath = path.join(__dirname, '..', 'producto.txt');
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
  const match = precioStr.match(/\$?([0-9,]+\.?[0-9]*)/);
  if (match) {
    return parseFloat(match[1].replace(',', ''));
  }
  return 0;
}

// Función para extraer número entero
function extraerNumero(numStr) {
  if (!numStr) return 0;
  const match = numStr.match(/([0-9,]+\.?[0-9]*)/);
  if (match) {
    return parseInt(match[1].replace(',', ''));
  }
  return 0;
}

// Función para determinar categoría basada en el nombre
function determinarCategoria(nombre) {
  const nombreLower = nombre.toLowerCase();
  
  if (nombreLower.includes('aceite')) return 'Lubricantes';
  if (nombreLower.includes('filtro')) return 'Filtros';
  if (nombreLower.includes('bujia') || nombreLower.includes('bujía')) return 'Encendido';
  if (nombreLower.includes('freno')) return 'Frenos';
  if (nombreLower.includes('bateria') || nombreLower.includes('batería')) return 'Eléctrico';
  if (nombreLower.includes('amortiguador')) return 'Suspensión';
  if (nombreLower.includes('cadena')) return 'Transmisión';
  if (nombreLower.includes('carburador')) return 'Carburación';
  if (nombreLower.includes('cilindro')) return 'Motor';
  if (nombreLower.includes('piston') || nombreLower.includes('pistón')) return 'Motor';
  if (nombreLower.includes('aro')) return 'Motor';
  if (nombreLower.includes('junta')) return 'Motor';
  if (nombreLower.includes('cable')) return 'Eléctrico';
  if (nombreLower.includes('lampara') || nombreLower.includes('lámpara')) return 'Iluminación';
  if (nombreLower.includes('faro') || nombreLower.includes('farol')) return 'Iluminación';
  if (nombreLower.includes('espejo')) return 'Espejos';
  if (nombreLower.includes('manubrio')) return 'Accesorios';
  if (nombreLower.includes('asiento')) return 'Accesorios';
  if (nombreLower.includes('funda')) return 'Accesorios';
  if (nombreLower.includes('casco')) return 'Seguridad';
  if (nombreLower.includes('guante')) return 'Seguridad';
  if (nombreLower.includes('agua')) return 'Refrigeración';
  if (nombreLower.includes('limpiador') || nombreLower.includes('limpieza')) return 'Limpieza';
  if (nombreLower.includes('grasa') || nombreLower.includes('lubricante')) return 'Lubricantes';
  if (nombreLower.includes('llanta') || nombreLower.includes('cubierta')) return 'Neumáticos';
  if (nombreLower.includes('candado')) return 'Seguridad';
  if (nombreLower.includes('herramienta')) return 'Herramientas';
  
  return 'Repuestos';
}

// Función para determinar unidad de medida
function determinarUnidadMedida(nombre) {
  const nombreLower = nombre.toLowerCase();
  
  if (nombreLower.includes('aceite') || nombreLower.includes('agua') || nombreLower.includes('líquido')) return 'Litro';
  if (nombreLower.includes('bujia') || nombreLower.includes('bujía') || nombreLower.includes('filtro')) return 'Unidad';
  if (nombreLower.includes('aro')) return 'Juego';
  if (nombreLower.includes('cable')) return 'Unidad';
  if (nombreLower.includes('junta')) return 'Unidad';
  if (nombreLower.includes('lampara') || nombreLower.includes('lámpara')) return 'Unidad';
  if (nombreLower.includes('faro') || nombreLower.includes('farol')) return 'Unidad';
  if (nombreLower.includes('espejo')) return 'Unidad';
  if (nombreLower.includes('manubrio')) return 'Unidad';
  if (nombreLower.includes('asiento')) return 'Unidad';
  if (nombreLower.includes('funda')) return 'Unidad';
  if (nombreLower.includes('casco')) return 'Unidad';
  if (nombreLower.includes('guante')) return 'Par';
  if (nombreLower.includes('llanta') || nombreLower.includes('cubierta')) return 'Unidad';
  if (nombreLower.includes('candado')) return 'Unidad';
  if (nombreLower.includes('herramienta')) return 'Unidad';
  
  return 'Unidad';
}

// Procesar productos
const productos = [];

// Saltar la primera línea (encabezados)
for (let i = 1; i < lineas.length; i++) {
  const linea = lineas[i];
  const campos = linea.split('\t');
  
  if (campos.length >= 8) {
    const codigo = limpiarValor(campos[0]);
    const descripcion = limpiarValor(campos[1]);
    const precioCosto = extraerPrecio(campos[2]);
    const precioVenta = extraerPrecio(campos[3]);
    const precioMayoreo = extraerPrecio(campos[4]);
    const inventario = extraerNumero(campos[5]);
    const invMinimo = extraerNumero(campos[6]);
    const departamento = limpiarValor(campos[7]);
    
    if (codigo && descripcion) {
      const categoria = determinarCategoria(descripcion);
      const unidadMedida = determinarUnidadMedida(descripcion);
      
      productos.push({
        codigo_sku: codigo,
        nombre: descripcion,
        descripcion: descripcion,
        costo: precioCosto,
        precio_minorista: precioVenta,
        precio_mayorista: precioMayoreo,
        stock: inventario,
        stock_minimo: invMinimo,
        categoria: categoria,
        unidad_medida: unidadMedida,
        activo: true
      });
    }
  }
}

// Generar SQL
let sql = `-- Script completo para migrar productos del archivo producto.txt
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columna stock_minimo
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;

-- 2. Eliminar todos los productos existentes
TRUNCATE TABLE productos RESTART IDENTITY CASCADE;

-- 3. Insertar productos del archivo producto.txt
-- Total de productos: ${productos.length}

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
`;

// Agregar productos al SQL
productos.forEach((producto, index) => {
  const isLast = index === productos.length - 1;
  const comma = isLast ? ';' : ',';
  
  sql += `('${producto.codigo_sku.replace(/'/g, "''")}', '${producto.nombre.replace(/'/g, "''")}', '${producto.descripcion.replace(/'/g, "''")}', ${producto.costo}, ${producto.precio_minorista}, ${producto.precio_mayorista}, ${producto.stock}, ${producto.stock_minimo}, '${producto.categoria}', '${producto.unidad_medida}', ${producto.activo})${comma}\n`;
});

// Agregar verificación final
sql += `
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
`;

// Guardar el archivo SQL
const outputPath = path.join(__dirname, '..', 'migrate-productos-complete.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ Script SQL generado exitosamente!`);
console.log(`📁 Archivo: ${outputPath}`);
console.log(`📊 Total de productos procesados: ${productos.length}`);

// Mostrar estadísticas
const categorias = {};
const unidades = {};
productos.forEach(p => {
  categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
  unidades[p.unidad_medida] = (unidades[p.unidad_medida] || 0) + 1;
});

console.log('\n📈 Estadísticas:');
console.log('Categorías:', Object.entries(categorias).map(([cat, count]) => `${cat}: ${count}`).join(', '));
console.log('Unidades de medida:', Object.entries(unidades).map(([unit, count]) => `${unit}: ${count}`).join(', '));
