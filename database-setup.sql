-- Script para configurar la tabla de productos en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla productos si no existe
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  codigo_sku VARCHAR(50) UNIQUE NOT NULL,
  precio_minorista DECIMAL(10,2) NOT NULL,
  precio_mayorista DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  categoria VARCHAR(100) NOT NULL,
  unidad_medida VARCHAR(50) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS (eliminar si existen primero)
DROP POLICY IF EXISTS productos_read_policy ON productos;
DROP POLICY IF EXISTS productos_insert_policy ON productos;
DROP POLICY IF EXISTS productos_update_policy ON productos;

-- Crear políticas RLS
CREATE POLICY productos_read_policy ON productos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY productos_insert_policy ON productos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY productos_update_policy ON productos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insertar datos de prueba si la tabla está vacía
INSERT INTO productos (nombre, descripcion, codigo_sku, precio_minorista, precio_mayorista, stock, categoria, unidad_medida, activo)
SELECT 
  'Aceite de Motor 5W-30',
  'Aceite sintético de alta calidad para motores modernos',
  'ACE-001',
  25.99,
  22.50,
  50,
  'Lubricantes',
  'Litro',
  true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo_sku = 'ACE-001');

INSERT INTO productos (nombre, descripcion, codigo_sku, precio_minorista, precio_mayorista, stock, categoria, unidad_medida, activo)
SELECT 
  'Filtro de Aire',
  'Filtro de aire de alta eficiencia',
  'FIL-001',
  15.99,
  12.75,
  30,
  'Filtros',
  'Unidad',
  true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo_sku = 'FIL-001');

INSERT INTO productos (nombre, descripcion, codigo_sku, precio_minorista, precio_mayorista, stock, categoria, unidad_medida, activo)
SELECT 
  'Bujía NGK',
  'Bujía de iridio para mejor rendimiento',
  'BUJ-001',
  8.99,
  7.20,
  100,
  'Encendido',
  'Unidad',
  true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo_sku = 'BUJ-001');

-- Verificar que los datos se insertaron correctamente
SELECT COUNT(*) as total_productos FROM productos;
