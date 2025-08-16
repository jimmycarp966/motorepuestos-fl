-- Insertar datos de ejemplo para Motorepuestos FL
-- Ejecutar después del quick-fix para poblar la base de datos

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, categoria, precio, stock, unidad_medida) VALUES 
('Aceite de Motor 4T', 'Aceite sintético para motos 4 tiempos', 'Lubricantes', 15.99, 50, 'lt'),
('Freno de Disco Delantero', 'Disco de freno para moto deportiva', 'Frenos', 45.50, 20, 'pcs'),
('Bujía NGK', 'Bujía de encendido estándar', 'Motores', 8.99, 100, 'pcs'),
('Filtro de Aire', 'Filtro de aire de alto rendimiento', 'Motores', 12.75, 30, 'pcs'),
('Aceite de Transmisión', 'Aceite específico para transmisión', 'Lubricantes', 18.50, 25, 'lt'),
('Pastillas de Freno', 'Pastillas de freno delanteras', 'Frenos', 22.00, 40, 'pcs'),
('Cadena de Transmisión', 'Cadena de transmisión estándar', 'Transmisión', 35.00, 15, 'pcs'),
('Batería 12V', 'Batería de moto 12V 7Ah', 'Eléctrico', 65.00, 10, 'pcs'),
('Neumático Trasero', 'Neumático trasero 130/70-17', 'Neumáticos', 85.00, 8, 'pcs'),
('Espejo Retrovisor', 'Espejo retrovisor izquierdo', 'Carrocería', 28.50, 12, 'pcs')
ON CONFLICT DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES 
('Juan Pérez', 'juan.perez@email.com', '+1234567890', 'Calle Principal 123'),
('María García', 'maria.garcia@email.com', '+1234567891', 'Avenida Central 456'),
('Carlos López', 'carlos.lopez@email.com', '+1234567892', 'Plaza Mayor 789'),
('Ana Rodríguez', 'ana.rodriguez@email.com', '+1234567893', 'Calle Secundaria 321'),
('Luis Martínez', 'luis.martinez@email.com', '+1234567894', 'Boulevard Norte 654')
ON CONFLICT DO NOTHING;

-- Insertar empleados adicionales
INSERT INTO empleados (nombre, email, telefono, rol) VALUES 
('Vendedor 1', 'vendedor1@motorepuestos.com', '+1234567895', 'Vendedor'),
('Técnico 1', 'tecnico1@motorepuestos.com', '+1234567896', 'Técnico'),
('Almacén 1', 'almacen1@motorepuestos.com', '+1234567897', 'Almacén')
ON CONFLICT (email) DO NOTHING;

-- Verificar datos insertados
SELECT 'Productos' as tabla, count(*) as total FROM productos
UNION ALL
SELECT 'Clientes' as tabla, count(*) as total FROM clientes
UNION ALL
SELECT 'Empleados' as tabla, count(*) as total FROM empleados;

-- Mostrar algunos productos
SELECT 'Productos disponibles:' as info;
SELECT nombre, categoria, precio, stock FROM productos LIMIT 5;
