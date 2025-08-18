-- Script para crear la tabla de arqueos de caja
-- Esta tabla almacenará los arqueos diarios de caja

-- Crear tabla arqueos_caja
CREATE TABLE IF NOT EXISTS arqueos_caja (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    efectivo_real DECIMAL(10,2) NOT NULL DEFAULT 0,
    tarjeta_real DECIMAL(10,2) NOT NULL DEFAULT 0,
    transferencia_real DECIMAL(10,2) NOT NULL DEFAULT 0,
    efectivo_esperado DECIMAL(10,2) NOT NULL DEFAULT 0,
    tarjeta_esperado DECIMAL(10,2) NOT NULL DEFAULT 0,
    transferencia_esperado DECIMAL(10,2) NOT NULL DEFAULT 0,
    efectivo_diferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
    tarjeta_diferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
    transferencia_diferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_real DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_esperado DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_diferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
    observaciones TEXT,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    completado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_arqueos_caja_fecha ON arqueos_caja(fecha);
CREATE INDEX IF NOT EXISTS idx_arqueos_caja_empleado ON arqueos_caja(empleado_id);
CREATE INDEX IF NOT EXISTS idx_arqueos_caja_completado ON arqueos_caja(completado);
CREATE INDEX IF NOT EXISTS idx_arqueos_caja_fecha_empleado ON arqueos_caja(fecha, empleado_id);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_arqueos_caja_updated_at 
    BEFORE UPDATE ON arqueos_caja 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear función para calcular totales automáticamente
CREATE OR REPLACE FUNCTION calcular_totales_arqueo()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular total real
    NEW.total_real = NEW.efectivo_real + NEW.tarjeta_real + NEW.transferencia_real;
    
    -- Calcular total esperado
    NEW.total_esperado = NEW.efectivo_esperado + NEW.tarjeta_esperado + NEW.transferencia_esperado;
    
    -- Calcular diferencias
    NEW.efectivo_diferencia = NEW.efectivo_real - NEW.efectivo_esperado;
    NEW.tarjeta_diferencia = NEW.tarjeta_real - NEW.tarjeta_esperado;
    NEW.transferencia_diferencia = NEW.transferencia_real - NEW.transferencia_esperado;
    NEW.total_diferencia = NEW.total_real - NEW.total_esperado;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calcular_totales_arqueo_trigger
    BEFORE INSERT OR UPDATE ON arqueos_caja
    FOR EACH ROW
    EXECUTE FUNCTION calcular_totales_arqueo();

-- Crear política RLS para seguridad
ALTER TABLE arqueos_caja ENABLE ROW LEVEL SECURITY;

-- Política para empleados: pueden ver sus propios arqueos
CREATE POLICY "Empleados pueden ver sus arqueos" ON arqueos_caja
    FOR SELECT USING (auth.uid() = empleado_id);

-- Política para empleados: pueden crear sus propios arqueos
CREATE POLICY "Empleados pueden crear arqueos" ON arqueos_caja
    FOR INSERT WITH CHECK (auth.uid() = empleado_id);

-- Política para empleados: pueden actualizar sus propios arqueos
CREATE POLICY "Empleados pueden actualizar sus arqueos" ON arqueos_caja
    FOR UPDATE USING (auth.uid() = empleado_id);

-- Política para administradores: pueden ver todos los arqueos
CREATE POLICY "Administradores pueden ver todos los arqueos" ON arqueos_caja
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados 
            WHERE empleados.id = auth.uid() 
            AND empleados.rol IN ('Administrador', 'Gerente')
        )
    );

-- Verificar que la tabla se creó correctamente
SELECT 
    'TABLA ARQUEOS_CAJA CREADA' as estado,
    COUNT(*) as registros
FROM arqueos_caja;

-- Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'arqueos_caja'
ORDER BY ordinal_position;
