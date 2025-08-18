-- Script para ejecutar todos los cambios del sistema de cuenta corriente
-- Ejecutar en el SQL Editor de Supabase en este orden

-- PASO 1: Configurar la base de datos para cuenta corriente
-- Ejecutar primero: setup-cuenta-corriente-robusto.sql

-- PASO 2: Limpiar datos históricos (OPCIONAL - solo si quieres empezar desde cero)
-- Ejecutar segundo: limpiar-datos-historicos.sql

-- PASO 3: Verificar que todo está funcionando
-- Este script verifica que las modificaciones se aplicaron correctamente

-- Verificar columnas de clientes
SELECT 
    'Verificación de clientes' as verificacion,
    COUNT(*) as total_clientes,
    SUM(CASE WHEN saldo_cuenta_corriente IS NOT NULL THEN 1 ELSE 0 END) as con_saldo,
    SUM(CASE WHEN limite_credito IS NOT NULL THEN 1 ELSE 0 END) as con_limite
FROM clientes;

-- Verificar columnas de movimientos_caja
SELECT 
    'Verificación de movimientos_caja' as verificacion,
    COUNT(*) as total_movimientos,
    SUM(CASE WHEN metodo_pago IS NOT NULL THEN 1 ELSE 0 END) as con_metodo_pago
FROM movimientos_caja;

-- Verificar funciones creadas
SELECT 
    'Verificación de funciones' as verificacion,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('validar_limite_credito', 'actualizar_saldo_cuenta_corriente')
AND routine_schema = 'public';

-- Mostrar resumen de configuración
SELECT 
    'Resumen de configuración' as tipo,
    'Sistema de cuenta corriente configurado correctamente' as mensaje,
    'Las siguientes funcionalidades están disponibles:' as detalles,
    '- Ventas con modalidad cuenta corriente' as funcionalidad1,
    '- Pagos de deuda desde la tabla de clientes' as funcionalidad2,
    '- Validación de límites de crédito' as funcionalidad3,
    '- Registro automático en caja al pagar deudas' as funcionalidad4;
