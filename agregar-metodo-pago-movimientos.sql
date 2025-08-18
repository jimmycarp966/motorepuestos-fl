-- Script para agregar columna metodo_pago a la tabla movimientos_caja
-- Ejecutar en el SQL Editor de Supabase

-- Agregar columna metodo_pago
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo';

-- Agregar comentario para documentación
COMMENT ON COLUMN movimientos_caja.metodo_pago IS 'Método de pago: efectivo, tarjeta, transferencia, cuenta_corriente, etc.';

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
AND column_name = 'metodo_pago';
