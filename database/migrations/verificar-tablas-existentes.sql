-- Script para verificar qué tablas existen en la base de datos
-- Ejecutar este script en Supabase para ver qué tablas están disponibles

-- ===== VERIFICAR TABLAS EXISTENTES =====

-- 1. Mostrar todas las tablas del esquema público
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Mostrar tablas específicas que podrían existir
SELECT 
    'productos' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'ventas' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ventas') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'detalles_venta' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'detalles_venta') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'clientes' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'cajas' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cajas') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'movimientos_caja' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movimientos_caja') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'empleados' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'empleados') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'arqueos' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'arqueos') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'facturas_afip' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'facturas_afip') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'cuentas_corrientes' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cuentas_corrientes') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado
UNION ALL
SELECT 
    'movimientos_cuenta_corriente' as tabla,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movimientos_cuenta_corriente') THEN 'EXISTE' ELSE 'NO EXISTE' END as estado;

-- 3. Mostrar secuencias existentes
SELECT 
    sequence_name,
    'SECUENCIA' as tipo
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- 4. Mostrar estructura de la tabla productos (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Contar registros en tablas principales (si existen)
SELECT 
    'productos' as tabla,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos') 
        THEN (SELECT COUNT(*) FROM productos)::text
        ELSE 'TABLA NO EXISTE'
    END as registros
UNION ALL
SELECT 
    'ventas' as tabla,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ventas') 
        THEN (SELECT COUNT(*) FROM ventas)::text
        ELSE 'TABLA NO EXISTE'
    END as registros
UNION ALL
SELECT 
    'clientes' as tabla,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') 
        THEN (SELECT COUNT(*) FROM clientes)::text
        ELSE 'TABLA NO EXISTE'
    END as registros
UNION ALL
SELECT 
    'empleados' as tabla,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'empleados') 
        THEN (SELECT COUNT(*) FROM empleados)::text
        ELSE 'TABLA NO EXISTE'
    END as registros;
