-- Script para crear la tabla de ventas y sus relaciones
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de items de venta
CREATE TABLE IF NOT EXISTS venta_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_empleado ON ventas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_venta ON venta_items(venta_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_producto ON venta_items(producto_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS para ventas
DROP POLICY IF EXISTS ventas_read_policy ON ventas;
CREATE POLICY ventas_read_policy ON ventas
    FOR SELECT USING (true);

DROP POLICY IF EXISTS ventas_insert_policy ON ventas;
CREATE POLICY ventas_insert_policy ON ventas
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS ventas_update_policy ON ventas;
CREATE POLICY ventas_update_policy ON ventas
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS ventas_delete_policy ON ventas;
CREATE POLICY ventas_delete_policy ON ventas
    FOR DELETE USING (true);

-- 6. Crear políticas RLS para venta_items
DROP POLICY IF EXISTS venta_items_read_policy ON venta_items;
CREATE POLICY venta_items_read_policy ON venta_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS venta_items_insert_policy ON venta_items;
CREATE POLICY venta_items_insert_policy ON venta_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS venta_items_update_policy ON venta_items;
CREATE POLICY venta_items_update_policy ON venta_items
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS venta_items_delete_policy ON venta_items;
CREATE POLICY venta_items_delete_policy ON venta_items
    FOR DELETE USING (true);

-- 7. Crear función para decrementar stock
CREATE OR REPLACE FUNCTION decrementar_stock(producto_id UUID, cantidad INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE productos 
    SET stock = stock - cantidad 
    WHERE id = producto_id AND stock >= cantidad;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado o stock insuficiente';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ventas_updated_at ON ventas;
CREATE TRIGGER update_ventas_updated_at
    BEFORE UPDATE ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Insertar datos de prueba (opcional)
-- INSERT INTO ventas (cliente_id, empleado_id, total, fecha) VALUES
--     (NULL, (SELECT id FROM empleados LIMIT 1), 150.00, NOW()),
--     (NULL, (SELECT id FROM empleados LIMIT 1), 75.50, NOW() - INTERVAL '1 day');

-- Verificar que las tablas se crearon correctamente
SELECT 'ventas' as tabla, COUNT(*) as registros FROM ventas
UNION ALL
SELECT 'venta_items' as tabla, COUNT(*) as registros FROM venta_items;
