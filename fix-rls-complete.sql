-- ===== CORRECCIÓN COMPLETA DE POLÍTICAS RLS =====
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar estado actual de RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'caja_movimientos');

-- 2. Habilitar RLS en todas las tablas principales
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja_movimientos ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar TODAS las políticas existentes que puedan causar conflictos
-- Empleados
DROP POLICY IF EXISTS "Empleados pueden ver todos los empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden insertar empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden actualizar empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden eliminar empleados" ON empleados;
DROP POLICY IF EXISTS "Enable read access for all users" ON empleados;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON empleados;
DROP POLICY IF EXISTS "Enable update for users based on email" ON empleados;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON empleados;

-- Productos
DROP POLICY IF EXISTS "Enable read access for all users" ON productos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON productos;
DROP POLICY IF EXISTS "Enable update for users based on email" ON productos;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON productos;

-- Clientes
DROP POLICY IF EXISTS "Enable read access for all users" ON clientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON clientes;
DROP POLICY IF EXISTS "Enable update for users based on email" ON clientes;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON clientes;

-- Ventas
DROP POLICY IF EXISTS "Enable read access for all users" ON ventas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON ventas;
DROP POLICY IF EXISTS "Enable update for users based on email" ON ventas;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON ventas;

-- Caja movimientos
DROP POLICY IF EXISTS "Enable read access for all users" ON caja_movimientos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON caja_movimientos;
DROP POLICY IF EXISTS "Enable update for users based on email" ON caja_movimientos;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON caja_movimientos;

-- 4. Crear políticas permisivas para desarrollo/testing
-- EMPLEADOS
CREATE POLICY "Empleados - SELECT" ON empleados FOR SELECT USING (true);
CREATE POLICY "Empleados - INSERT" ON empleados FOR INSERT WITH CHECK (true);
CREATE POLICY "Empleados - UPDATE" ON empleados FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Empleados - DELETE" ON empleados FOR DELETE USING (true);

-- PRODUCTOS
CREATE POLICY "Productos - SELECT" ON productos FOR SELECT USING (true);
CREATE POLICY "Productos - INSERT" ON productos FOR INSERT WITH CHECK (true);
CREATE POLICY "Productos - UPDATE" ON productos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Productos - DELETE" ON productos FOR DELETE USING (true);

-- CLIENTES
CREATE POLICY "Clientes - SELECT" ON clientes FOR SELECT USING (true);
CREATE POLICY "Clientes - INSERT" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Clientes - UPDATE" ON clientes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Clientes - DELETE" ON clientes FOR DELETE USING (true);

-- VENTAS
CREATE POLICY "Ventas - SELECT" ON ventas FOR SELECT USING (true);
CREATE POLICY "Ventas - INSERT" ON ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Ventas - UPDATE" ON ventas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Ventas - DELETE" ON ventas FOR DELETE USING (true);

-- CAJA MOVIMIENTOS
CREATE POLICY "Caja - SELECT" ON caja_movimientos FOR SELECT USING (true);
CREATE POLICY "Caja - INSERT" ON caja_movimientos FOR INSERT WITH CHECK (true);
CREATE POLICY "Caja - UPDATE" ON caja_movimientos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Caja - DELETE" ON caja_movimientos FOR DELETE USING (true);

-- 5. Verificar que las políticas se crearon correctamente
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
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'caja_movimientos')
ORDER BY tablename, cmd;

-- 6. Probar inserción de empleado completo
DO $$
DECLARE
    test_email TEXT := 'test-' || extract(epoch from now()) || '@motorepuestos.com';
    test_id UUID;
BEGIN
    -- Insertar empleado de prueba
    INSERT INTO empleados (nombre, email, rol, salario, permisos_modulos, activo, created_at, updated_at)
    VALUES (
        'Test Empleado Completo',
        test_email,
        'Vendedor',
        1500.00,
        ARRAY['dashboard', 'ventas', 'clientes'],
        true,
        NOW(),
        NOW()
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Empleado insertado exitosamente con ID: %', test_id;
    
    -- Verificar que se puede leer
    IF EXISTS (SELECT 1 FROM empleados WHERE id = test_id) THEN
        RAISE NOTICE '✅ Empleado se puede leer correctamente';
    ELSE
        RAISE NOTICE '❌ Error: No se puede leer el empleado insertado';
    END IF;
    
    -- Limpiar empleado de prueba
    DELETE FROM empleados WHERE id = test_id;
    RAISE NOTICE '✅ Empleado de prueba eliminado';
    
END $$;

-- 7. Verificar estructura de tabla empleados
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'empleados' 
ORDER BY ordinal_position;
