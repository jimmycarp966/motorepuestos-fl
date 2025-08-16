-- Script para crear usuario de prueba en Supabase
-- Ejecutar este script después de configurar las tablas

-- Insertar empleado administrador
INSERT INTO empleados (nombre, email, rol) VALUES 
('Administrador', 'admin@motorepuestos.com', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, categoria, precio, stock, unidad_medida) VALUES 
('Aceite de Motor 4T', 'Aceite sintético para motos 4 tiempos', 'Lubricantes', 15.99, 50, 'lt'),
('Freno de Disco Delantero', 'Disco de freno para moto deportiva', 'Frenos', 45.50, 20, 'pcs'),
('Bujía NGK', 'Bujía de encendido estándar', 'Motores', 8.99, 100, 'pcs'),
('Filtro de Aire', 'Filtro de aire de alto rendimiento', 'Motores', 12.75, 30, 'pcs'),
('Aceite de Transmisión', 'Aceite específico para transmisión', 'Lubricantes', 18.50, 25, 'lt')
ON CONFLICT DO NOTHING;

-- Verificar datos insertados
SELECT 'Empleados' as tabla, count(*) as total FROM empleados
UNION ALL
SELECT 'Productos' as tabla, count(*) as total FROM productos;
