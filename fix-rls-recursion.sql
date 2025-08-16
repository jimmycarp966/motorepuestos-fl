-- =====================================================
-- SCRIPT PARA SOLUCIONAR RECURSIÓN INFINITA EN RLS
-- Error: infinite recursion detected in policy for relation "empleados"
-- =====================================================

-- 1. VERIFICAR POLÍTICAS ACTUALES
SELECT '=== POLÍTICAS ACTUALES ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'movimientos_caja')
ORDER BY tablename, policyname;

-- 2. ELIMINAR TODAS LAS POLÍTICAS PROBLEMÁTICAS
SELECT '=== ELIMINANDO POLÍTICAS PROBLEMÁTICAS ===' as info;

-- Eliminar políticas de empleados
DROP POLICY IF EXISTS "Allow authenticated users" ON empleados;
DROP POLICY IF EXISTS "Admin can do everything" ON empleados;

-- Eliminar políticas de productos
DROP POLICY IF EXISTS "Allow authenticated users" ON productos;
DROP POLICY IF EXISTS "Admin can do everything" ON productos;

-- Eliminar políticas de clientes
DROP POLICY IF EXISTS "Allow authenticated users" ON clientes;
DROP POLICY IF EXISTS "Admin can do everything" ON clientes;

-- Eliminar políticas de ventas
DROP POLICY IF EXISTS "Allow authenticated users" ON ventas;
DROP POLICY IF EXISTS "Admin can do everything" ON ventas;

-- Eliminar políticas de movimientos_caja
DROP POLICY IF EXISTS "Allow authenticated users" ON movimientos_caja;
DROP POLICY IF EXISTS "Admin can do everything" ON movimientos_caja;

-- 3. DESHABILITAR RLS TEMPORALMENTE
SELECT '=== DESHABILITANDO RLS ===' as info;

ALTER TABLE empleados DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja DISABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT '=== VERIFICANDO RLS DESHABILITADO ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'movimientos_caja')
ORDER BY tablename;

-- 5. VERIFICAR QUE NO HAY POLÍTICAS
SELECT '=== VERIFICANDO POLÍTICAS ELIMINADAS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'movimientos_caja')
ORDER BY tablename, policyname;

-- 6. PRUEBA DE CONEXIÓN
SELECT '=== PRUEBA DE CONEXIÓN ===' as info;

-- Verificar que podemos acceder a empleados
SELECT COUNT(*) as total_empleados FROM empleados;

-- Verificar usuario dani
SELECT 
    id,
    nombre,
    email,
    rol,
    activo
FROM empleados 
WHERE email = 'dani@fl.com';

SELECT '=== CONFIGURACIÓN COMPLETADA ===' as info;
SELECT 'RLS deshabilitado temporalmente para evitar recursión infinita' as resultado;
SELECT 'La aplicación ahora debería poder conectarse sin problemas' as resultado;
