-- Configuración de la base de datos para Motorepuestos FL
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 10,
    unidad_medida VARCHAR(20) DEFAULT 'pcs',
    codigo_barras VARCHAR(100),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    direccion TEXT,
    documento VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de empleados (con restricción corregida)
CREATE TABLE IF NOT EXISTS empleados (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    rol VARCHAR(50) NOT NULL DEFAULT 'Vendedor',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT empleados_rol_check CHECK (rol IN ('Vendedor', 'Técnico', 'Almacén', 'Administrador', 'Gerente', 'Cajero'))
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes(id),
    empleado_id UUID REFERENCES empleados(id),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    metodo_pago VARCHAR(50) DEFAULT 'efectivo',
    estado VARCHAR(50) DEFAULT 'completada',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS venta_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto DECIMAL(10,2) NOT NULL,
    concepto TEXT NOT NULL,
    empleado_id UUID REFERENCES empleados(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
        RAISE EXCEPTION 'Producto no encontrado o stock insuficiente';
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

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
DROP TRIGGER IF EXISTS update_empleados_updated_at ON empleados;
DROP TRIGGER IF EXISTS update_ventas_updated_at ON ventas;

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Productos visibles para todos los usuarios autenticados" ON productos;
DROP POLICY IF EXISTS "Productos editables para usuarios autenticados" ON productos;
DROP POLICY IF EXISTS "Clientes visibles para todos los usuarios autenticados" ON clientes;
DROP POLICY IF EXISTS "Clientes editables para usuarios autenticados" ON clientes;
DROP POLICY IF EXISTS "Empleados visibles para todos los usuarios autenticados" ON empleados;
DROP POLICY IF EXISTS "Empleados editables para usuarios autenticados" ON empleados;
DROP POLICY IF EXISTS "Ventas visibles para todos los usuarios autenticados" ON ventas;
DROP POLICY IF EXISTS "Ventas editables para usuarios autenticados" ON ventas;
DROP POLICY IF EXISTS "Items de venta visibles para todos los usuarios autenticados" ON venta_items;
DROP POLICY IF EXISTS "Items de venta editables para usuarios autenticados" ON venta_items;
DROP POLICY IF EXISTS "Movimientos de caja visibles para todos los usuarios autenticados" ON movimientos_caja;
DROP POLICY IF EXISTS "Movimientos de caja editables para usuarios autenticados" ON movimientos_caja;

-- Políticas para productos
CREATE POLICY "Productos visibles para todos los usuarios autenticados" ON productos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Productos editables para usuarios autenticados" ON productos
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para clientes
CREATE POLICY "Clientes visibles para todos los usuarios autenticados" ON clientes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Clientes editables para usuarios autenticados" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para empleados
CREATE POLICY "Empleados visibles para todos los usuarios autenticados" ON empleados
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Empleados editables para usuarios autenticados" ON empleados
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para ventas
CREATE POLICY "Ventas visibles para todos los usuarios autenticados" ON ventas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Ventas editables para usuarios autenticados" ON ventas
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para venta_items
CREATE POLICY "Items de venta visibles para todos los usuarios autenticados" ON venta_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Items de venta editables para usuarios autenticados" ON venta_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para movimientos_caja
CREATE POLICY "Movimientos de caja visibles para todos los usuarios autenticados" ON movimientos_caja
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Movimientos de caja editables para usuarios autenticados" ON movimientos_caja
    FOR ALL USING (auth.role() = 'authenticated');

-- Insertar datos de ejemplo (solo si no existen)
INSERT INTO empleados (nombre, email, rol) VALUES 
('Administrador', 'admin@motorepuestos.com', 'Administrador')
ON CONFLICT (email) DO NOTHING;

INSERT INTO productos (nombre, descripcion, categoria, precio, stock, unidad_medida) VALUES 
('Aceite de Motor 4T', 'Aceite sintético para motos 4 tiempos', 'Lubricantes', 15.99, 50, 'lt'),
('Freno de Disco Delantero', 'Disco de freno para moto deportiva', 'Frenos', 45.50, 20, 'pcs'),
('Bujía NGK', 'Bujía de encendido estándar', 'Motores', 8.99, 100, 'pcs'),
('Filtro de Aire', 'Filtro de aire de alto rendimiento', 'Motores', 12.75, 30, 'pcs'),
('Aceite de Transmisión', 'Aceite específico para transmisión', 'Lubricantes', 18.50, 25, 'lt')
ON CONFLICT DO NOTHING;

-- Crear índices para mejor rendimiento (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_fecha ON movimientos_caja(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo ON movimientos_caja(tipo);
