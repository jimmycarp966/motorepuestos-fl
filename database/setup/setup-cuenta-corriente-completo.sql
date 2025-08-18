-- Script completo para configurar el sistema de cuenta corriente
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columnas de cuenta corriente a clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS saldo_cuenta_corriente DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS limite_credito DECIMAL(10,2) DEFAULT 0;

-- 2. Agregar columna metodo_pago a movimientos_caja
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'efectivo';

-- 3. Agregar comentarios para documentación
COMMENT ON COLUMN clientes.saldo_cuenta_corriente IS 'Saldo actual de la cuenta corriente del cliente (negativo = deuda)';
COMMENT ON COLUMN clientes.limite_credito IS 'Límite de crédito máximo permitido para el cliente';
COMMENT ON COLUMN movimientos_caja.metodo_pago IS 'Método de pago: efectivo, tarjeta, transferencia, cuenta_corriente, etc.';

-- 4. Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS validar_limite_credito(UUID, NUMERIC);
DROP FUNCTION IF EXISTS validar_limite_credito(UUID, DECIMAL);
DROP FUNCTION IF EXISTS actualizar_saldo_cuenta_corriente(UUID, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS actualizar_saldo_cuenta_corriente(UUID, DECIMAL, TEXT);

-- 5. Crear función para validar límite de crédito
CREATE OR REPLACE FUNCTION validar_limite_credito(
    p_cliente_id UUID,
    p_monto DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_limite_credito DECIMAL(10,2);
    v_saldo_actual DECIMAL(10,2);
    v_nuevo_saldo DECIMAL(10,2);
BEGIN
    -- Obtener límite y saldo actual del cliente
    SELECT limite_credito, saldo_cuenta_corriente 
    INTO v_limite_credito, v_saldo_actual
    FROM clientes 
    WHERE id = p_cliente_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente no encontrado';
    END IF;
    
    -- Calcular nuevo saldo
    v_nuevo_saldo := v_saldo_actual + p_monto;
    
    -- Validar límite de crédito
    IF v_limite_credito > 0 AND v_nuevo_saldo > v_limite_credito THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear función para actualizar saldo de cuenta corriente
CREATE OR REPLACE FUNCTION actualizar_saldo_cuenta_corriente(
    p_cliente_id UUID,
    p_monto DECIMAL(10,2),
    p_tipo TEXT -- 'cargo' o 'pago'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_nuevo_saldo DECIMAL(10,2);
BEGIN
    -- Actualizar saldo según el tipo
    IF p_tipo = 'cargo' THEN
        UPDATE clientes 
        SET saldo_cuenta_corriente = saldo_cuenta_corriente + p_monto,
            updated_at = NOW()
        WHERE id = p_cliente_id
        RETURNING saldo_cuenta_corriente INTO v_nuevo_saldo;
    ELSIF p_tipo = 'pago' THEN
        UPDATE clientes 
        SET saldo_cuenta_corriente = saldo_cuenta_corriente - p_monto,
            updated_at = NOW()
        WHERE id = p_cliente_id
        RETURNING saldo_cuenta_corriente INTO v_nuevo_saldo;
    ELSE
        RAISE EXCEPTION 'Tipo inválido. Debe ser "cargo" o "pago"';
    END IF;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente no encontrado';
    END IF;
    
    RETURN v_nuevo_saldo;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar que todo se configuró correctamente
SELECT 
    'clientes' as tabla,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('saldo_cuenta_corriente', 'limite_credito')

UNION ALL

SELECT 
    'movimientos_caja' as tabla,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' 
AND column_name = 'metodo_pago'

ORDER BY tabla, column_name;
