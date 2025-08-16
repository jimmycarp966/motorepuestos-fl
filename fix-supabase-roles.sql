-- =====================================================
-- SCRIPT DE CONFIGURACIÓN COMPLETA DE SUPABASE
-- Para solucionar el error: "role 'admin' does not exist"
-- =====================================================

-- 1. VERIFICAR ESTADO ACTUAL
SELECT '=== ESTADO ACTUAL ===' as info;

-- Verificar roles existentes
SELECT rolname as "Roles Existentes" 
FROM pg_roles 
WHERE rolname IN ('admin', 'authenticated', 'anon', 'service_role');

-- Verificar usuario dani@fl.com
SELECT '=== USUARIO DANI ===' as info;
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at
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

-- 2. CONFIGURAR ROLES Y PERMISOS
SELECT '=== CONFIGURANDO ROLES ===' as info;

-- Crear rol admin si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
        RAISE NOTICE 'Rol admin creado';
    ELSE
        RAISE NOTICE 'Rol admin ya existe';
    END IF;
END
$$;

-- Asignar permisos al rol admin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- 3. CONFIGURAR USUARIO DANI COMO ADMIN
SELECT '=== CONFIGURANDO USUARIO DANI ===' as info;

-- Actualizar rol en auth.users
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'dani@fl.com';

-- Verificar que se actualizó
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as role,
    created_at
FROM auth.users 
WHERE email = 'dani@fl.com';

-- 4. CONFIGURAR TABLA EMPLEADOS
SELECT '=== CONFIGURANDO TABLA EMPLEADOS ===' as info;

-- Actualizar o insertar empleado dani
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
    rol,
    activo,
    created_at
FROM empleados 
WHERE email = 'dani@fl.com';

-- 5. CONFIGURAR POLÍTICAS RLS
SELECT '=== CONFIGURANDO POLÍTICAS RLS ===' as info;

-- Habilitar RLS en tablas principales
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- Política para empleados (admin puede ver todo)
DROP POLICY IF EXISTS "Admin can do everything" ON empleados;
CREATE POLICY "Admin can do everything" ON empleados
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Política para productos (admin puede ver todo)
DROP POLICY IF EXISTS "Admin can do everything" ON productos;
CREATE POLICY "Admin can do everything" ON productos
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Política para clientes (admin puede ver todo)
DROP POLICY IF EXISTS "Admin can do everything" ON clientes;
CREATE POLICY "Admin can do everything" ON clientes
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Política para ventas (admin puede ver todo)
DROP POLICY IF EXISTS "Admin can do everything" ON ventas;
CREATE POLICY "Admin can do everything" ON ventas
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Política para movimientos_caja (admin puede ver todo)
DROP POLICY IF EXISTS "Admin can do everything" ON movimientos_caja;
CREATE POLICY "Admin can do everything" ON movimientos_caja
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 6. VERIFICACIÓN FINAL
SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Verificar roles
SELECT rolname as "Roles Configurados" 
FROM pg_roles 
WHERE rolname IN ('admin', 'authenticated', 'anon', 'service_role');

-- Verificar usuario dani
SELECT 
    'Usuario Dani' as tipo,
    email,
    raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'dani@fl.com'

UNION ALL

SELECT 
    'Empleado Dani' as tipo,
    email,
    rol as role
FROM empleados 
WHERE email = 'dani@fl.com';

-- Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'movimientos_caja');

SELECT '=== CONFIGURACIÓN COMPLETADA ===' as info;
SELECT 'El usuario dani@fl.com ahora tiene rol admin y acceso completo' as resultado;
