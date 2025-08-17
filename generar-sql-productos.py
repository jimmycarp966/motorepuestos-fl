#!/usr/bin/env python3
"""
Script para generar SQL de inserción de todos los productos del archivo producto.txt
"""

import re

def parse_producto_line(line):
    """Parsea una línea del archivo producto.txt"""
    # Formato: Codigo\tDescripcion\tPrecio Costo\tPrecio Venta\tPrecio Mayoreo\tInventario\tInv. Minimo\tDepartamento
    parts = line.strip().split('\t')
    
    if len(parts) >= 8:
        codigo_sku = parts[0].strip()
        nombre = parts[1].strip()
        precio_costo = parts[2].strip().replace('$', '').replace(',', '')
        precio_venta = parts[3].strip().replace('$', '').replace(',', '')
        precio_mayoreo = parts[4].strip().replace('$', '').replace(',', '')
        inventario = parts[5].strip().replace(',', '')
        inv_minimo = parts[6].strip().replace(',', '')
        departamento = parts[7].strip()
        
        # Convertir valores numéricos
        try:
            stock = float(inventario) if inventario and inventario != '' else 0
            precio_minorista = float(precio_venta) if precio_venta and precio_venta != '' else 0
            precio_mayorista = float(precio_mayoreo) if precio_mayoreo and precio_mayoreo != '' else 0
        except ValueError:
            stock = 0
            precio_minorista = 0
            precio_mayorista = 0
        
        # Determinar categoría basada en el departamento o nombre
        categoria = 'Repuestos'
        if departamento != '- Sin Departamento -':
            categoria = departamento
        elif 'aceite' in nombre.lower():
            categoria = 'Lubricantes'
        elif 'bateria' in nombre.lower():
            categoria = 'Eléctrico'
        elif 'foco' in nombre.lower() or 'luz' in nombre.lower():
            categoria = 'Iluminación'
        
        # Generar descripción
        descripcion = f"{nombre} - {categoria}"
        
        return {
            'nombre': nombre,
            'codigo_sku': codigo_sku,
            'categoria': categoria,
            'stock': int(stock),
            'precio_minorista': int(precio_minorista),
            'precio_mayorista': int(precio_mayorista),
            'descripcion': descripcion,
            'unidad_medida': 'unidad',
            'activo': True
        }
    return None

def generate_sql():
    """Genera el SQL completo para insertar todos los productos"""
    
    sql_header = """-- Script generado automáticamente para importar TODOS los productos del archivo producto.txt
-- Esto asegurará que tengamos los 1432 productos en la base de datos

-- 1. Verificar estado actual
SELECT 
    'ESTADO ACTUAL' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos
FROM productos;

-- 2. LIMPIAR productos existentes (opcional - solo si quieres empezar de cero)
-- DELETE FROM productos;

-- 3. IMPORTAR TODOS los productos del archivo producto.txt
INSERT INTO productos (nombre, codigo_sku, categoria, stock, precio_minorista, precio_mayorista, descripcion, unidad_medida, activo)
VALUES 
"""

    sql_footer = """
ON CONFLICT (codigo_sku) DO NOTHING;

-- 4. Verificar estado después de la importación
SELECT 
    'ESTADO POST IMPORTACION' as tipo,
    COUNT(*) as total_productos,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as productos_activos,
    SUM(CASE WHEN activo = false THEN 1 ELSE 0 END) as productos_inactivos
FROM productos;

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
"""

    try:
        # Intentar diferentes codificaciones
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        lines = None
        
        for encoding in encodings:
            try:
                with open('producto.txt', 'r', encoding=encoding) as file:
                    lines = file.readlines()
                print(f"✅ Archivo leído con codificación: {encoding}")
                break
            except UnicodeDecodeError:
                continue
        
        if lines is None:
            print("❌ Error: No se pudo leer el archivo con ninguna codificación")
            return
        
        values = []
        for i, line in enumerate(lines):
            # Saltar la primera línea (encabezados)
            if i == 0:
                continue
                
            if line.strip() and not line.startswith('#'):
                producto = parse_producto_line(line)
                if producto and producto['nombre'] and producto['codigo_sku']:
                    # Escapar comillas simples en los valores
                    nombre = producto['nombre'].replace("'", "''")
                    descripcion = producto['descripcion'].replace("'", "''")
                    
                    value = f"    ('{nombre}', '{producto['codigo_sku']}', '{producto['categoria']}', {producto['stock']}, {producto['precio_minorista']}, {producto['precio_mayorista']}, '{descripcion}', '{producto['unidad_medida']}', {str(producto['activo']).lower()})"
                    values.append(value)
        
        # Generar el SQL completo
        sql_content = sql_header + ',\n'.join(values) + sql_footer
        
        # Escribir el archivo SQL
        with open('importar-todos-productos-completo.sql', 'w', encoding='utf-8') as sql_file:
            sql_file.write(sql_content)
        
        print(f"✅ SQL generado exitosamente!")
        print(f"📊 Total de productos procesados: {len(values)}")
        print(f"📁 Archivo generado: importar-todos-productos-completo.sql")
        
        # Mostrar algunos ejemplos
        print(f"\n🔍 Ejemplos de productos:")
        for i, value in enumerate(values[:5]):
            print(f"   {i+1}. {value}")
        
        if len(values) > 5:
            print(f"   ... y {len(values) - 5} productos más")
            
    except FileNotFoundError:
        print("❌ Error: No se encontró el archivo producto.txt")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    generate_sql()
