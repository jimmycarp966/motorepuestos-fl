-- Script simple para solucionar permisos de administrador
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla empleados
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'empleados' 
ORDER BY ordinal_position;

-- 2. Verificar constraint de rol
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname LIKE '%rol%';

-- 3. Asignar rol de administrador
UPDATE auth.users 
SET role = 'admin'
WHERE email = 'dani@fl.com';

-- 4. Crear perfil de empleado administrador (usando rol válido)
INSERT INTO empleados (
    id,
    nombre,
    email,
    rol
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'dani@fl.com'),
    'Daniel',
    'dani@fl.com',
    'admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
    rol = 'admin';

-- 5. Verificar cambios
SELECT 
    u.email,
    u.role as auth_role,
    e.rol as empleado_rol
FROM auth.users u
LEFT JOIN empleados e ON u.id = e.id
WHERE u.email = 'dani@fl.com';

