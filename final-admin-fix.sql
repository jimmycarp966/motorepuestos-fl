-- Script FINAL para solucionar permisos de administrador
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si el usuario ya existe
SELECT 
    id,
    email,
    role
FROM auth.users 
WHERE email = 'dani@fl.com';

-- 2. Asignar rol de administrador en auth.users
UPDATE auth.users 
SET role = 'admin'
WHERE email = 'dani@fl.com';

-- 3. Verificar si ya existe un empleado con ese email
SELECT 
    id,
    nombre,
    email,
    rol,
    activo
FROM empleados 
WHERE email = 'dani@fl.com';

-- 4. Si existe, actualizar el rol y activar
UPDATE empleados 
SET 
    rol = 'Administrador',
    activo = true,
    updated_at = NOW()
WHERE email = 'dani@fl.com';

-- 5. Si no existe, crear nuevo empleado
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
);

-- 6. Verificar configuración final
SELECT 
    u.email,
    u.role as auth_role,
    e.rol as empleado_rol,
    e.activo
FROM auth.users u
LEFT JOIN empleados e ON u.id = e.id
WHERE u.email = 'dani@fl.com';
