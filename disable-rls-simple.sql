-- =====================================================
-- SCRIPT SIMPLE PARA DESHABILITAR RLS
-- Soluciona: infinite recursion detected in policy
-- =====================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS
DROP POLICY IF EXISTS "Allow authenticated users" ON empleados;
DROP POLICY IF EXISTS "Admin can do everything" ON empleados;
DROP POLICY IF EXISTS "Allow authenticated users" ON productos;
DROP POLICY IF EXISTS "Admin can do everything" ON productos;
DROP POLICY IF EXISTS "Allow authenticated users" ON clientes;
DROP POLICY IF EXISTS "Admin can do everything" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users" ON ventas;
DROP POLICY IF EXISTS "Admin can do everything" ON ventas;
DROP POLICY IF EXISTS "Allow authenticated users" ON movimientos_caja;
DROP POLICY IF EXISTS "Admin can do everything" ON movimientos_caja;

-- 2. DESHABILITAR RLS
ALTER TABLE empleados DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR
SELECT 'RLS deshabilitado - Prueba la aplicación ahora' as resultado;
