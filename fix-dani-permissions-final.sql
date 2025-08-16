-- Script FINAL para corregir permisos del usuario dani@fl.com
-- Ejecutar en Supabase SQL Editor
-- Basado en la constraint confirmada: empleados_rol_check

-- 1. Verificar estado actual del usuario en auth.users
SELECT 
    '=== ESTADO ACTUAL EN AUTH.USERS ===' as info;
    
SELECT 
    u.id,
    u.email,
    u.role as auth_role,
    u.created_at,
    u.last_sign_in_at
FROM auth.users u
WHERE u.email = 'dani@fl.com';

-- 2. Verificar estado actual en tabla empleados
SELECT 
    '=== ESTADO ACTUAL EN EMPLEADOS ===' as info;
    
SELECT 
    e.id,
    e.nombre,
    e.email,
    e.rol,
    e.activo,
    e.created_at,
    e.updated_at
FROM empleados e
WHERE e.email = 'dani@fl.com';

-- 3. CORRECCIÓN: Asignar rol de administrador en auth.users
SELECT 
    '=== ASIGNANDO ROL ADMIN EN AUTH.USERS ===' as info;

UPDATE auth.users 
SET role = 'admin'
WHERE email = 'dani@fl.com';

-- 4. CORRECCIÓN: Crear o actualizar perfil en empleados con rol correcto
SELECT 
    '=== CREANDO/ACTUALIZANDO PERFIL EN EMPLEADOS ===' as info;

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
    'Administrador',  -- Rol válido según constraint
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

-- 5. VERIFICACIÓN FINAL: Confirmar configuración correcta
SELECT 
    '=== VERIFICACIÓN FINAL ===' as info;
    
SELECT 
    u.email,
    u.role as auth_role,
    e.rol as empleado_rol,
    e.activo,
    CASE 
        WHEN u.role = 'admin' AND e.rol = 'Administrador' AND e.activo = true 
        THEN '✅ CONFIGURACIÓN CORRECTA - Usuario listo para usar'
        ELSE '❌ CONFIGURACIÓN INCORRECTA - Revisar pasos anteriores'
    END as estado
FROM auth.users u
LEFT JOIN empleados e ON u.id = e.id
WHERE u.email = 'dani@fl.com';

-- 6. VERIFICACIÓN DE PERMISOS: Listar todos los permisos disponibles
SELECT 
    '=== PERMISOS DISPONIBLES PARA ADMINISTRADOR ===' as info;

-- Crear tabla temporal con permisos
WITH permisos_admin AS (
    SELECT 'admin' as permiso
    UNION ALL SELECT 'dashboard'
    UNION ALL SELECT 'empleados'
    UNION ALL SELECT 'productos'
    UNION ALL SELECT 'clientes'
    UNION ALL SELECT 'ventas'
    UNION ALL SELECT 'caja'
    UNION ALL SELECT 'reportes'
    UNION ALL SELECT 'inventario'
    UNION ALL SELECT 'proveedores'
    UNION ALL SELECT 'categorias'
    UNION ALL SELECT 'compras'
    UNION ALL SELECT 'gastos'
)
SELECT 
    permiso,
    CASE 
        WHEN permiso = 'admin' THEN '🔑 Permiso maestro'
        WHEN permiso IN ('dashboard', 'reportes') THEN '📊 Módulo de visualización'
        WHEN permiso IN ('empleados', 'productos', 'clientes') THEN '👥 Gestión de datos'
        WHEN permiso IN ('ventas', 'caja') THEN '💰 Operaciones comerciales'
        WHEN permiso IN ('inventario', 'proveedores', 'categorias') THEN '📦 Gestión de inventario'
        WHEN permiso IN ('compras', 'gastos') THEN '💳 Operaciones financieras'
        ELSE '📋 Módulo general'
    END as descripcion
FROM permisos_admin
ORDER BY permiso;

-- 7. VERIFICACIÓN DE CONSTRAINT: Confirmar que el rol es válido
SELECT 
    '=== VERIFICACIÓN DE CONSTRAINT ===' as info;
    
SELECT 
    'Administrador' as rol_a_asignar,
    CASE 
        WHEN 'Administrador' = ANY(ARRAY['Vendedor', 'Técnico', 'Almacén', 'Administrador', 'Gerente', 'Cajero'])
        THEN '✅ ROL VÁLIDO - Cumple con la constraint'
        ELSE '❌ ROL INVÁLIDO - No cumple con la constraint'
    END as validacion_constraint;

-- 8. INSTRUCCIONES PARA EL USUARIO
SELECT 
    '=== INSTRUCCIONES PARA EL USUARARIO ===' as info;
    
SELECT 
    '1. Cerrar sesión en la aplicación' as paso,
    '2. Volver a iniciar sesión con dani@fl.com' as paso,
    '3. Verificar que aparecen todos los módulos en el sidebar' as paso,
    '4. Probar acceso a cada módulo' as paso,
    '5. Si persiste el problema, contactar soporte' as paso;
