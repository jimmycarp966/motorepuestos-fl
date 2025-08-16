-- Script para configurar roles y permisos correctamente
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar constraint de roles
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname = 'empleados_rol_check';

-- 2. Verificar roles existentes
SELECT DISTINCT rol FROM empleados ORDER BY rol;

-- 3. Crear usuario administrador si no existe
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role
) 
SELECT 
    gen_random_uuid(),
    'admin@motorepuestos.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@motorepuestos.com'
);

-- 4. Crear empleado administrador
INSERT INTO empleados (
    id,
    nombre,
    email,
    rol,
    activo,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'Administrador del Sistema',
    'admin@motorepuestos.com',
    'Administrador',
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'admin@motorepuestos.com'
AND NOT EXISTS (
    SELECT 1 FROM empleados e WHERE e.email = 'admin@motorepuestos.com'
);

-- 5. Configurar políticas RLS básicas para empleados
-- Permitir lectura a usuarios autenticados
CREATE POLICY IF NOT EXISTS "empleados_select_policy" ON empleados
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción a administradores
CREATE POLICY IF NOT EXISTS "empleados_insert_policy" ON empleados
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empleados 
            WHERE id = auth.uid() 
            AND rol = 'Administrador' 
            AND activo = true
        )
    );

-- Permitir actualización a administradores o al propio usuario
CREATE POLICY IF NOT EXISTS "empleados_update_policy" ON empleados
    FOR UPDATE USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM empleados 
            WHERE id = auth.uid() 
            AND rol = 'Administrador' 
            AND activo = true
        )
    );

-- 6. Configurar políticas para otras tablas
-- Productos: lectura para todos, escritura para administradores
CREATE POLICY IF NOT EXISTS "productos_select_policy" ON productos
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "productos_insert_policy" ON productos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empleados 
            WHERE id = auth.uid() 
            AND rol IN ('Administrador', 'Gerente', 'Técnico', 'Almacén')
            AND activo = true
        )
    );

-- Clientes: lectura para todos, escritura para vendedores y superiores
CREATE POLICY IF NOT EXISTS "clientes_select_policy" ON clientes
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "clientes_insert_policy" ON clientes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empleados 
            WHERE id = auth.uid() 
            AND rol IN ('Administrador', 'Gerente', 'Vendedor')
            AND activo = true
        )
    );

-- Ventas: lectura para todos, escritura para vendedores y superiores
CREATE POLICY IF NOT EXISTS "ventas_select_policy" ON ventas
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "ventas_insert_policy" ON ventas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empleados 
            WHERE id = auth.uid() 
            AND rol IN ('Administrador', 'Gerente', 'Vendedor', 'Cajero')
            AND activo = true
        )
    );

-- Caja movimientos: lectura para todos, escritura para cajeros y superiores
CREATE POLICY IF NOT EXISTS "caja_movimientos_select_policy" ON caja_movimientos
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "caja_movimientos_insert_policy" ON caja_movimientos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empleados 
            WHERE id = auth.uid() 
            AND rol IN ('Administrador', 'Gerente', 'Cajero')
            AND activo = true
        )
    );

-- 7. Verificar configuración final
SELECT 
    'Configuración completada' as status,
    COUNT(*) as total_empleados,
    COUNT(CASE WHEN rol = 'Administrador' THEN 1 END) as administradores
FROM empleados;
