-- Script para verificar y corregir permisos del usuario dani@fl.com
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estado actual del usuario
SELECT 
    'Estado actual del usuario:' as info,
    u.id,
    u.email,
    u.role as auth_role,
    u.created_at,
    u.last_sign_in_at
FROM auth.users u
WHERE u.email = 'dani@fl.com';

-- 2. Verificar estado en tabla empleados
SELECT 
    'Estado en tabla empleados:' as info,
    e.id,
    e.nombre,
    e.email,
    e.rol,
    e.activo,
    e.created_at,
    e.updated_at
FROM empleados e
WHERE e.email = 'dani@fl.com';

-- 3. Asignar rol de administrador en auth.users
UPDATE auth.users 
SET role = 'admin'
WHERE email = 'dani@fl.com';

-- 4. Crear o actualizar perfil en empleados
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
    'Daniel',
    'dani@fl.com',
    'Administrador',
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'dani@fl.com'
AND NOT EXISTS (
    SELECT 1 FROM empleados e WHERE e.email = 'dani@fl.com'
)
ON CONFLICT (id) 
DO UPDATE SET 
    rol = 'Administrador',
    activo = true,
    updated_at = NOW();

-- 5. Verificar configuración final
SELECT 
    'Configuración final:' as info,
    u.email,
    u.role as auth_role,
    e.rol as empleado_rol,
    e.activo,
    CASE 
        WHEN u.role = 'admin' AND e.rol = 'Administrador' AND e.activo = true 
        THEN '✅ Configuración correcta'
        ELSE '❌ Configuración incorrecta'
    END as estado
FROM auth.users u
LEFT JOIN empleados e ON u.id = e.id
WHERE u.email = 'dani@fl.com';

-- 6. Verificar permisos disponibles para administrador
SELECT 
    'Permisos disponibles para administrador:' as info,
    'admin' as permiso,
    'dashboard' as permiso,
    'empleados' as permiso,
    'productos' as permiso,
    'clientes' as permiso,
    'ventas' as permiso,
    'caja' as permiso,
    'reportes' as permiso,
    'inventario' as permiso,
    'proveedores' as permiso,
    'categorias' as permiso,
    'compras' as permiso,
    'gastos' as permiso;

-- 7. Verificar constraint de roles
SELECT 
    'Constraint de roles:' as info,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname LIKE '%rol%';
