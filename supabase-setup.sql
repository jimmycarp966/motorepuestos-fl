-- Configuración de tablas para Motorepuestos F.L.

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'cajero', 'vendedor', 'consulta')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes(id),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS venta_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- Tabla de movimientos de caja
CREATE TABLE IF NOT EXISTS caja_movimientos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    concepto VARCHAR(255) NOT NULL,
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para decrementar stock
CREATE OR REPLACE FUNCTION decrementar_stock(producto_id UUID, cantidad INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE productos 
    SET stock = stock - cantidad,
        updated_at = NOW()
    WHERE id = producto_id AND stock >= cantidad;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Stock insuficiente o producto no encontrado';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja_movimientos ENABLE ROW LEVEL SECURITY;

-- Políticas para empleados (solo admin puede gestionar)
CREATE POLICY "Admin can manage empleados" ON empleados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados e 
            WHERE e.email = current_user 
            AND e.rol = 'admin' 
            AND e.activo = true
        )
    );

-- Políticas para productos (todos pueden ver, admin puede gestionar)
CREATE POLICY "All can view productos" ON productos
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage productos" ON productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados e 
            WHERE e.email = current_user 
            AND e.rol = 'admin' 
            AND e.activo = true
        )
    );

-- Políticas para clientes (todos pueden ver, admin y vendedor pueden gestionar)
CREATE POLICY "All can view clientes" ON clientes
    FOR SELECT USING (true);

CREATE POLICY "Admin and vendedor can manage clientes" ON clientes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados e 
            WHERE e.email = current_user 
            AND (e.rol IN ('admin', 'vendedor')) 
            AND e.activo = true
        )
    );

-- Políticas para ventas (todos pueden ver, admin, cajero y vendedor pueden crear)
CREATE POLICY "All can view ventas" ON ventas
    FOR SELECT USING (true);

CREATE POLICY "Authorized can manage ventas" ON ventas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados e 
            WHERE e.email = current_user 
            AND (e.rol IN ('admin', 'cajero', 'vendedor')) 
            AND e.activo = true
        )
    );

-- Políticas para caja (admin y cajero pueden gestionar)
CREATE POLICY "Admin and cajero can manage caja" ON caja_movimientos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados e 
            WHERE e.email = current_user 
            AND (e.rol IN ('admin', 'cajero')) 
            AND e.activo = true
        )
    );

-- Insertar empleado administrador por defecto
INSERT INTO empleados (nombre, email, rol, activo) 
VALUES ('Administrador', 'admin@motorepuestos.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar algunos productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, categoria, unidad_medida) VALUES
('Aceite de Motor 5W-30', 'Aceite sintético para motor', 25.99, 50, 'Lubricantes', 'Litro'),
('Filtro de Aire', 'Filtro de aire para motor', 15.50, 30, 'Filtros', 'Unidad'),
('Bujía NGK', 'Bujía de encendido NGK', 8.99, 100, 'Encendido', 'Unidad'),
('Freno de Disco', 'Pastillas de freno de disco', 45.00, 20, 'Frenos', 'Juego'),
('Batería 12V', 'Batería de 12V 60Ah', 89.99, 10, 'Eléctrico', 'Unidad')
ON CONFLICT DO NOTHING;

-- Insertar algunos clientes de ejemplo
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Juan Pérez', 'juan@email.com', '555-0101', 'Calle Principal 123'),
('María García', 'maria@email.com', '555-0202', 'Avenida Central 456'),
('Carlos López', 'carlos@email.com', '555-0303', 'Plaza Mayor 789')
ON CONFLICT DO NOTHING;
