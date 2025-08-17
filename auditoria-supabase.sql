-- AUDITORÍA EXHAUSTIVA DE SUPABASE - MOTOREPUESTOS FL
-- Este script verifica que todas las tablas existan y contengan datos correctos

-- =====================================================
-- 1. VERIFICACIÓN DE TABLAS EXISTENTES
-- =====================================================

SELECT 'VERIFICACIÓN DE TABLAS' as seccion;

-- Listar todas las tablas del esquema public
SELECT 
    table_name,
    'EXISTE' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 2. VERIFICACIÓN DE ESTRUCTURA DE TABLAS
-- =====================================================

SELECT 'ESTRUCTURA DE TABLAS' as seccion;

-- Estructura de productos
SELECT 'productos' as tabla, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'productos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de clientes
SELECT 'clientes' as tabla, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de empleados
SELECT 'empleados' as tabla, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'empleados' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de ventas
SELECT 'ventas' as tabla, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de venta_items
SELECT 'venta_items' as tabla, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'venta_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de movimientos_caja
SELECT 'movimientos_caja' as tabla, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'movimientos_caja' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de arqueos_caja
SELECT 'arqueos_caja' as tabla, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'arqueos_caja' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICACIÓN DE DATOS EN TABLAS
-- =====================================================

SELECT 'CONTEO DE DATOS' as seccion;

-- Contar registros en cada tabla
SELECT 'productos' as tabla, COUNT(*) as total_registros, COUNT(CASE WHEN activo = true THEN 1 END) as activos
FROM productos;

SELECT 'clientes' as tabla, COUNT(*) as total_registros, COUNT(CASE WHEN activo = true THEN 1 END) as activos
FROM clientes;

SELECT 'empleados' as tabla, COUNT(*) as total_registros, COUNT(CASE WHEN activo = true THEN 1 END) as activos
FROM empleados;

SELECT 'ventas' as tabla, COUNT(*) as total_registros, COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas
FROM ventas;

SELECT 'venta_items' as tabla, COUNT(*) as total_registros
FROM venta_items;

SELECT 'movimientos_caja' as tabla, COUNT(*) as total_registros,
       COUNT(CASE WHEN tipo = 'ingreso' THEN 1 END) as ingresos,
       COUNT(CASE WHEN tipo = 'egreso' THEN 1 END) as egresos
FROM movimientos_caja;

SELECT 'arqueos_caja' as tabla, COUNT(*) as total_registros, COUNT(CASE WHEN completado = true THEN 1 END) as completados
FROM arqueos_caja;

-- =====================================================
-- 4. VERIFICACIÓN DE RELACIONES Y INTEGRIDAD
-- =====================================================

SELECT 'VERIFICACIÓN DE INTEGRIDAD' as seccion;

-- Verificar ventas sin items
SELECT 'Ventas sin items' as problema, COUNT(*) as cantidad
FROM ventas v
LEFT JOIN venta_items vi ON v.id = vi.venta_id
WHERE vi.id IS NULL;

-- Verificar items sin venta
SELECT 'Items sin venta' as problema, COUNT(*) as cantidad
FROM venta_items vi
LEFT JOIN ventas v ON vi.venta_id = v.id
WHERE v.id IS NULL;

-- Verificar movimientos sin empleado
SELECT 'Movimientos sin empleado' as problema, COUNT(*) as cantidad
FROM movimientos_caja mc
LEFT JOIN empleados e ON mc.empleado_id = e.id
WHERE e.id IS NULL;

-- Verificar arqueos sin empleado
SELECT 'Arqueos sin empleado' as problema, COUNT(*) as cantidad
FROM arqueos_caja ac
LEFT JOIN empleados e ON ac.empleado_id = e.id
WHERE e.id IS NULL;

-- =====================================================
-- 5. VERIFICACIÓN DE FUNCIONES Y TRIGGERS
-- =====================================================

SELECT 'FUNCIONES Y TRIGGERS' as seccion;

-- Verificar funciones existentes
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar triggers existentes
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 6. VERIFICACIÓN DE POLÍTICAS RLS
-- =====================================================

SELECT 'POLÍTICAS RLS' as seccion;

-- Verificar políticas RLS habilitadas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas específicas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 7. VERIFICACIÓN DE ÍNDICES
-- =====================================================

SELECT 'ÍNDICES' as seccion;

-- Verificar índices existentes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 8. MUESTRAS DE DATOS RECIENTES
-- =====================================================

SELECT 'MUESTRAS DE DATOS RECIENTES' as seccion;

-- Últimos 5 productos
SELECT 'Últimos 5 productos' as muestra, id, nombre, precio_minorista, stock, activo, created_at
FROM productos 
ORDER BY created_at DESC 
LIMIT 5;

-- Últimas 5 ventas
SELECT 'Últimas 5 ventas' as muestra, id, total, metodo_pago, estado, fecha, created_at
FROM ventas 
ORDER BY created_at DESC 
LIMIT 5;

-- Últimos 5 movimientos de caja
SELECT 'Últimos 5 movimientos' as muestra, id, tipo, monto, concepto, fecha, created_at
FROM movimientos_caja 
ORDER BY created_at DESC 
LIMIT 5;

-- Últimos 5 arqueos
SELECT 'Últimos 5 arqueos' as muestra, id, fecha, total_real, total_esperado, total_diferencia, completado, created_at
FROM arqueos_caja 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- 9. VERIFICACIÓN DE CONFIGURACIÓN DE AUTENTICACIÓN
-- =====================================================

SELECT 'CONFIGURACIÓN DE AUTH' as seccion;

-- Verificar si auth está habilitado
SELECT 'Auth habilitado' as configuracion, 
       CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'auth') 
            THEN 'SÍ' ELSE 'NO' END as estado;

-- =====================================================
-- 10. RESUMEN FINAL
-- =====================================================

SELECT 'RESUMEN FINAL' as seccion;

-- Resumen de todas las tablas y sus conteos
SELECT 
    'RESUMEN COMPLETO' as tipo,
    'productos' as tabla,
    (SELECT COUNT(*) FROM productos) as total,
    (SELECT COUNT(*) FROM productos WHERE activo = true) as activos
UNION ALL
SELECT 
    'RESUMEN COMPLETO',
    'clientes',
    (SELECT COUNT(*) FROM clientes),
    (SELECT COUNT(*) FROM clientes WHERE activo = true)
UNION ALL
SELECT 
    'RESUMEN COMPLETO',
    'empleados',
    (SELECT COUNT(*) FROM empleados),
    (SELECT COUNT(*) FROM empleados WHERE activo = true)
UNION ALL
SELECT 
    'RESUMEN COMPLETO',
    'ventas',
    (SELECT COUNT(*) FROM ventas),
    (SELECT COUNT(*) FROM ventas WHERE estado = 'completada')
UNION ALL
SELECT 
    'RESUMEN COMPLETO',
    'venta_items',
    (SELECT COUNT(*) FROM venta_items),
    NULL
UNION ALL
SELECT 
    'RESUMEN COMPLETO',
    'movimientos_caja',
    (SELECT COUNT(*) FROM movimientos_caja),
    (SELECT COUNT(*) FROM movimientos_caja WHERE tipo = 'ingreso')
UNION ALL
SELECT 
    'RESUMEN COMPLETO',
    'arqueos_caja',
    (SELECT COUNT(*) FROM arqueos_caja),
    (SELECT COUNT(*) FROM arqueos_caja WHERE completado = true)
ORDER BY tabla;
