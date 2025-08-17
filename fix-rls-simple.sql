-- ===== CORRECCIÓN SIMPLE DE POLÍTICAS RLS =====
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar qué tablas existen en el esquema public
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Habilitar RLS solo en la tabla empleados (que es la que necesitamos)
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes de empleados
DROP POLICY IF EXISTS "Empleados pueden ver todos los empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden insertar empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden actualizar empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden eliminar empleados" ON empleados;
DROP POLICY IF EXISTS "Enable read access for all users" ON empleados;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON empleados;
DROP POLICY IF EXISTS "Enable update for users based on email" ON empleados;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON empleados;

-- 4. Crear políticas permisivas para empleados
CREATE POLICY "Empleados - SELECT" ON empleados FOR SELECT USING (true);
CREATE POLICY "Empleados - INSERT" ON empleados FOR INSERT WITH CHECK (true);
CREATE POLICY "Empleados - UPDATE" ON empleados FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Empleados - DELETE" ON empleados FOR DELETE USING (true);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'empleados'
ORDER BY cmd;

-- 6. Probar inserción de empleado
DO $$
DECLARE
    test_email TEXT := 'test-' || extract(epoch from now()) || '@motorepuestos.com';
    test_id UUID;
BEGIN
    -- Insertar empleado de prueba
    INSERT INTO empleados (nombre, email, rol, salario, permisos_modulos, activo, created_at, updated_at)
    VALUES (
        'Test Empleado',
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
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empleados' 
ORDER BY ordinal_position;
