-- Solución rápida para el problema de restricciones
-- Ejecutar este script para corregir el error de empleados_rol_check

-- Eliminar la restricción problemática
ALTER TABLE empleados DROP CONSTRAINT IF EXISTS empleados_rol_check;

-- Crear una nueva restricción más flexible
ALTER TABLE empleados ADD CONSTRAINT empleados_rol_check 
CHECK (rol IN ('Vendedor', 'Técnico', 'Almacén', 'Administrador', 'Gerente', 'Cajero'));

-- Intentar insertar el empleado administrador
INSERT INTO empleados (nombre, email, rol) VALUES 
('Administrador', 'admin@motorepuestos.com', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- Verificar que se insertó correctamente
SELECT 'Empleado insertado:' as status, nombre, email, rol FROM empleados WHERE email = 'admin@motorepuestos.com';

-- Mostrar todos los empleados
SELECT 'Todos los empleados:' as info;
SELECT nombre, email, rol FROM empleados;
