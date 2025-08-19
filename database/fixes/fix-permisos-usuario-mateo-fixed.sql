-- Script para verificar y corregir permisos del usuario Mateo (VERSIÓN CORREGIDA)
-- Este script asegura que el usuario solo tenga acceso a los módulos especificados

-- 1. Verificar el estado actual del usuario Mateo
SELECT 
    id,
    nombre,
    email,
    rol,
    permisos_modulos,
    activo
FROM empleados 
WHERE email LIKE '%mateo%' OR nombre ILIKE '%mateo%';

-- 2. Actualizar permisos para que solo tenga acceso a: clientes, cajas, ventas
UPDATE empleados 
SET permisos_modulos = ARRAY['clientes', 'caja', 'ventas']
WHERE (email LIKE '%mateo%' OR nombre ILIKE '%mateo%')
  AND activo = true;

-- 3. Verificar que el cambio se aplicó correctamente
SELECT 
    id,
    nombre,
    email,
    rol,
    permisos_modulos,
    activo
FROM empleados 
WHERE email LIKE '%mateo%' OR nombre ILIKE '%mateo%';

-- 4. Verificar que no hay otros usuarios con permisos incorrectos
SELECT 
    id,
    nombre,
    email,
    rol,
    permisos_modulos
FROM empleados 
WHERE activo = true
  AND (
    'dashboard' = ANY(permisos_modulos) OR
    'productos' = ANY(permisos_modulos) OR
    'empleados' = ANY(permisos_modulos) OR
    'reportes' = ANY(permisos_modulos)
  )
  AND rol NOT IN ('Administrador', 'Gerente');

-- 5. Crear función para validar permisos (VERSIÓN CORREGIDA)
CREATE OR REPLACE FUNCTION validar_permisos_empleado()
RETURNS TABLE (
    empleado_id text,
    nombre text,
    email text,
    rol text,
    permisos_actuales text[],
    permisos_recomendados text[],
    necesita_correccion boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::text,
        e.nombre::text,
        e.email::text,
        e.rol::text,
        e.permisos_modulos,
        CASE 
            WHEN e.rol = 'Administrador' THEN ARRAY['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes']
            WHEN e.rol = 'Gerente' THEN ARRAY['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'reportes']
            WHEN e.rol = 'Vendedor' THEN ARRAY['dashboard', 'clientes', 'ventas']
            WHEN e.rol = 'Técnico' THEN ARRAY['dashboard', 'productos']
            WHEN e.rol = 'Almacén' THEN ARRAY['dashboard', 'productos']
            WHEN e.rol = 'Cajero' THEN ARRAY['dashboard', 'clientes', 'ventas', 'caja']
            ELSE ARRAY[]::text[]
        END as permisos_recomendados,
        CASE 
            WHEN e.rol = 'Administrador' THEN false -- Los administradores pueden tener cualquier permiso
            WHEN e.rol = 'Gerente' THEN false -- Los gerentes pueden tener cualquier permiso
            ELSE e.permisos_modulos != CASE 
                WHEN e.rol = 'Vendedor' THEN ARRAY['dashboard', 'clientes', 'ventas']
                WHEN e.rol = 'Técnico' THEN ARRAY['dashboard', 'productos']
                WHEN e.rol = 'Almacén' THEN ARRAY['dashboard', 'productos']
                WHEN e.rol = 'Cajero' THEN ARRAY['dashboard', 'clientes', 'ventas', 'caja']
                ELSE ARRAY[]::text[]
            END
        END as necesita_correccion
    FROM empleados e
    WHERE e.activo = true;
END;
$$ LANGUAGE plpgsql;

-- 6. Ejecutar validación
SELECT * FROM validar_permisos_empleado();
