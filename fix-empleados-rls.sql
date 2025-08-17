-- Verificar y corregir políticas RLS para la tabla empleados
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'empleados';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Empleados pueden ver todos los empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden insertar empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden actualizar empleados" ON empleados;
DROP POLICY IF EXISTS "Empleados pueden eliminar empleados" ON empleados;

-- 4. Crear políticas para permitir acceso completo (temporal para testing)
-- Política para SELECT - permitir ver todos los empleados
CREATE POLICY "Empleados pueden ver todos los empleados" ON empleados
    FOR SELECT USING (true);

-- Política para INSERT - permitir insertar empleados
CREATE POLICY "Empleados pueden insertar empleados" ON empleados
    FOR INSERT WITH CHECK (true);

-- Política para UPDATE - permitir actualizar empleados
CREATE POLICY "Empleados pueden actualizar empleados" ON empleados
    FOR UPDATE USING (true) WITH CHECK (true);

-- Política para DELETE - permitir eliminar empleados
CREATE POLICY "Empleados pueden eliminar empleados" ON empleados
    FOR DELETE USING (true);

-- 5. Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'empleados';

-- 6. Verificar la estructura de la tabla empleados
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'empleados' 
ORDER BY ordinal_position;

-- 7. Insertar un empleado de prueba para verificar que funciona
INSERT INTO empleados (nombre, email, rol, salario, permisos_modulos, activo, created_at, updated_at)
VALUES (
    'Test Empleado',
    'test@motorepuestos.com',
    'Vendedor',
    1500.00,
    ARRAY['dashboard', 'ventas', 'clientes'],
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 8. Verificar que el empleado se insertó correctamente
SELECT * FROM empleados WHERE email = 'test@motorepuestos.com';

-- 9. Limpiar empleado de prueba
DELETE FROM empleados WHERE email = 'test@motorepuestos.com';
