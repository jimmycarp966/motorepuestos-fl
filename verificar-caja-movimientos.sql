-- Script para verificar y corregir la tabla movimientos_caja
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'movimientos_caja';

-- 2. Si no existe, crearla
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto DECIMAL(10,2) NOT NULL,
    concepto TEXT NOT NULL,
    empleado_id UUID REFERENCES empleados(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Movimientos de caja visibles para todos los usuarios autenticados" ON movimientos_caja;
DROP POLICY IF EXISTS "Movimientos de caja editables para usuarios autenticados" ON movimientos_caja;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON movimientos_caja;
DROP POLICY IF EXISTS "Allow authenticated users" ON movimientos_caja;
DROP POLICY IF EXISTS "Admin can do everything" ON movimientos_caja;

-- 5. Crear políticas simples para desarrollo
CREATE POLICY "Enable all for authenticated users" ON movimientos_caja
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_fecha ON movimientos_caja(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo ON movimientos_caja(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empleado ON movimientos_caja(empleado_id);

-- 7. Verificar la estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja'
ORDER BY ordinal_position;

-- 8. Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'movimientos_caja';

-- 9. Insertar un movimiento de prueba
INSERT INTO movimientos_caja (tipo, monto, concepto, empleado_id) 
VALUES ('ingreso', 100.00, 'Prueba de sistema', (SELECT id FROM empleados LIMIT 1))
ON CONFLICT DO NOTHING;

-- 10. Verificar que funciona
SELECT 
    m.*,
    e.nombre as empleado_nombre
FROM movimientos_caja m
LEFT JOIN empleados e ON m.empleado_id = e.id
ORDER BY m.created_at DESC
LIMIT 5;
