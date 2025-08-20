-- Script para agregar columna estado a las tablas para implementar sistema de tachado
-- Ejecutar este script para habilitar la funcionalidad de elementos eliminados

-- Agregar columna estado a movimientos_caja
ALTER TABLE movimientos_caja 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activa';

-- Agregar columna estado a ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activa';

-- Agregar columna estado a venta_items (opcional, para consistencia)
ALTER TABLE venta_items 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activa';

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_estado ON movimientos_caja(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_venta_items_estado ON venta_items(estado);

-- Actualizar registros existentes para que tengan estado 'activa'
UPDATE movimientos_caja SET estado = 'activa' WHERE estado IS NULL;
UPDATE ventas SET estado = 'activa' WHERE estado IS NULL;
UPDATE venta_items SET estado = 'activa' WHERE estado IS NULL;

-- Comentarios sobre el uso:
-- estado puede ser: 'activa', 'eliminada', 'cancelada', etc.
-- Los elementos con estado 'eliminada' se mostrarán tachados pero seguirán visibles
-- Los cálculos de saldo y estadísticas excluirán elementos con estado 'eliminada'
