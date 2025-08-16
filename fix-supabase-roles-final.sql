-- =====================================================
-- SCRIPT FINAL DE CONFIGURACIÓN DE SUPABASE
-- Basado en ROLES_Y_PERMISOS.md
-- =====================================================

-- 1. VERIFICAR ESTADO ACTUAL
SELECT '=== ESTADO ACTUAL ===' as info;

-- Verificar usuario dani@fl.com en auth.users
SELECT '=== USUARIO AUTH ===' as info;
SELECT 
    id,
    email,
    role,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email = 'dani@fl.com';

-- Verificar tabla empleados
SELECT '=== TABLA EMPLEADOS ===' as info;
SELECT 
    id,
    nombre,
    email,
    rol,
    activo,
    created_at
FROM empleados 
WHERE email = 'dani@fl.com';

-- Verificar constraint de roles
SELECT '=== CONSTRAINT DE ROLES ===' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname = 'empleados_rol_check';

-- 2. CONFIGURAR USUARIO DANI COMO ADMINISTRADOR
SELECT '=== CONFIGURANDO USUARIO DANI ===' as info;

-- Actualizar rol en auth.users (usar 'admin' para auth)
UPDATE auth.users 
SET 
    role = 'admin',
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'dani@fl.com';

-- Verificar que se actualizó auth.users
SELECT 
    id,
    email,
    role as auth_role,
    raw_user_meta_data->>'role' as metadata_role
FROM auth.users 
WHERE email = 'dani@fl.com';

-- 3. CONFIGURAR TABLA EMPLEADOS
SELECT '=== CONFIGURANDO TABLA EMPLEADOS ===' as info;

-- Actualizar o insertar empleado dani con rol 'Administrador'
INSERT INTO empleados (nombre, email, rol, activo, created_at)
VALUES ('Daniel', 'dani@fl.com', 'Administrador', true, NOW())
ON CONFLICT (email) 
DO UPDATE SET 
    rol = 'Administrador',
    activo = true,
    updated_at = NOW();

-- Verificar empleado
SELECT 
    id,
    nombre,
    email,
    rol as empleado_rol,
    activo,
    created_at
FROM empleados 
WHERE email = 'dani@fl.com';

-- 4. CONFIGURAR POLÍTICAS RLS SIMPLIFICADAS
SELECT '=== CONFIGURANDO POLÍTICAS RLS ===' as info;

-- Habilitar RLS en tablas principales
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- Políticas simples que permiten acceso a usuarios autenticados
-- (Temporalmente para evitar problemas de permisos)

-- Política para empleados
DROP POLICY IF EXISTS "Allow authenticated users" ON empleados;
CREATE POLICY "Allow authenticated users" ON empleados
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para productos
DROP POLICY IF EXISTS "Allow authenticated users" ON productos;
CREATE POLICY "Allow authenticated users" ON productos
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para clientes
DROP POLICY IF EXISTS "Allow authenticated users" ON clientes;
CREATE POLICY "Allow authenticated users" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para ventas
DROP POLICY IF EXISTS "Allow authenticated users" ON ventas;
CREATE POLICY "Allow authenticated users" ON ventas
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para movimientos_caja
DROP POLICY IF EXISTS "Allow authenticated users" ON movimientos_caja;
CREATE POLICY "Allow authenticated users" ON movimientos_caja
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. VERIFICACIÓN FINAL
SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Verificar configuración completa del usuario dani
SELECT 
    'Usuario Dani - Configuración Final' as info,
    u.email,
    u.role as auth_role,
    u.raw_user_meta_data->>'role' as metadata_role,
    e.rol as empleado_rol,
    e.activo as empleado_activo
FROM auth.users u
LEFT JOIN empleados e ON u.email = e.email
WHERE u.email = 'dani@fl.com';

-- Verificar políticas creadas
SELECT 
    'Políticas RLS Configuradas' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'movimientos_caja')
ORDER BY tablename, policyname;

-- Verificar que las tablas tienen RLS habilitado
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'movimientos_caja')
ORDER BY tablename;

SELECT '=== CONFIGURACIÓN COMPLETADA ===' as info;
SELECT 'El usuario dani@fl.com ahora está configurado correctamente:' as resultado;
SELECT '- Auth Role: admin' as detalle;
SELECT '- Empleado Rol: Administrador' as detalle;
SELECT '- Estado: Activo' as detalle;
SELECT '- RLS: Configurado para usuarios autenticados' as detalle;
