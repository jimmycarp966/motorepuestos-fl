-- Script robusto para configurar la tabla de productos en Supabase
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

-- Habilitar RLS (ignorar si ya está habilitado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'productos' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Eliminar políticas existentes si existen
DO $$
BEGIN
  -- Política de lectura
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'productos' 
    AND policyname = 'productos_read_policy'
  ) THEN
    DROP POLICY productos_read_policy ON productos;
  END IF;
  
  -- Política de inserción
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'productos' 
    AND policyname = 'productos_insert_policy'
  ) THEN
    DROP POLICY productos_insert_policy ON productos;
  END IF;
  
  -- Política de actualización
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'productos' 
    AND policyname = 'productos_update_policy'
  ) THEN
    DROP POLICY productos_update_policy ON productos;
  END IF;
END $$;

-- Crear políticas RLS
CREATE POLICY productos_read_policy ON productos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY productos_insert_policy ON productos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY productos_update_policy ON productos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insertar datos de prueba solo si no existen
DO $$
BEGIN
  -- Aceite de Motor
  IF NOT EXISTS (SELECT 1 FROM productos WHERE codigo_sku = 'ACE-001') THEN
    INSERT INTO productos (nombre, descripcion, codigo_sku, precio_minorista, precio_mayorista, stock, categoria, unidad_medida, activo)
    VALUES (
      'Aceite de Motor 5W-30',
      'Aceite sintético de alta calidad para motores modernos',
      'ACE-001',
      25.99,
      22.50,
      50,
      'Lubricantes',
      'Litro',
      true
    );
  END IF;
  
  -- Filtro de Aire
  IF NOT EXISTS (SELECT 1 FROM productos WHERE codigo_sku = 'FIL-001') THEN
    INSERT INTO productos (nombre, descripcion, codigo_sku, precio_minorista, precio_mayorista, stock, categoria, unidad_medida, activo)
    VALUES (
      'Filtro de Aire',
      'Filtro de aire de alta eficiencia',
      'FIL-001',
      15.99,
      12.75,
      30,
      'Filtros',
      'Unidad',
      true
    );
  END IF;
  
  -- Bujía NGK
  IF NOT EXISTS (SELECT 1 FROM productos WHERE codigo_sku = 'BUJ-001') THEN
    INSERT INTO productos (nombre, descripcion, codigo_sku, precio_minorista, precio_mayorista, stock, categoria, unidad_medida, activo)
    VALUES (
      'Bujía NGK',
      'Bujía de iridio para mejor rendimiento',
      'BUJ-001',
      8.99,
      7.20,
      100,
      'Encendido',
      'Unidad',
      true
    );
  END IF;
END $$;

-- Verificar configuración
SELECT 
  'Tabla productos' as elemento,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'productos') 
    THEN '✅ Creada' 
    ELSE '❌ No existe' 
  END as estado
UNION ALL
SELECT 
  'RLS habilitado' as elemento,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'productos' AND rowsecurity = true) 
    THEN '✅ Habilitado' 
    ELSE '❌ Deshabilitado' 
  END as estado
UNION ALL
SELECT 
  'Políticas RLS' as elemento,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'productos') >= 3
    THEN '✅ Configuradas (' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'productos') || ')'
    ELSE '❌ Faltan políticas' 
  END as estado
UNION ALL
SELECT 
  'Datos de prueba' as elemento,
  CASE 
    WHEN (SELECT COUNT(*) FROM productos) >= 3
    THEN '✅ Insertados (' || (SELECT COUNT(*) FROM productos) || ')'
    ELSE '❌ Sin datos' 
  END as estado;
