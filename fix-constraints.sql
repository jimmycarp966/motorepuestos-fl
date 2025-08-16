-- Script para verificar y corregir restricciones de la tabla empleados
-- Ejecutar este script si hay problemas con las restricciones

-- Verificar las restricciones existentes en la tabla empleados
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass;

-- Eliminar la restricción de verificación del rol si existe
ALTER TABLE empleados DROP CONSTRAINT IF EXISTS empleados_rol_check;

-- Crear una nueva restricción más flexible para el rol
ALTER TABLE empleados ADD CONSTRAINT empleados_rol_check 
CHECK (rol IN ('Vendedor', 'Técnico', 'Almacén', 'Administrador', 'Gerente', 'Cajero'));

-- Verificar que la tabla empleados tiene la estructura correcta
\d empleados;

-- Intentar insertar el empleado administrador nuevamente
INSERT INTO empleados (nombre, email, rol) VALUES 
('Administrador', 'admin@motorepuestos.com', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- Verificar que se insertó correctamente
SELECT * FROM empleados WHERE email = 'admin@motorepuestos.com';
