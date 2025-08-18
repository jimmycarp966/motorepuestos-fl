-- ================================================
-- VERIFICAR DEPENDENCIAS DEL SISTEMA MOTOREPUESTOS FL
-- ================================================
-- Script para verificar que todas las tablas y funciones existen

-- ================================
-- VERIFICAR TABLAS PRINCIPALES
-- ================================

DO $$
DECLARE
  tabla_record RECORD;
  tablas_requeridas TEXT[] := ARRAY[
    'empleados', 'productos', 'clientes', 'ventas', 'venta_items',
    'movimientos_caja', 'cajas_diarias', 'arqueos_caja',
    'notificaciones', 'error_log', 'audit_log', 'notificaciones_sistema'
  ];
  tabla_existe BOOLEAN;
BEGIN
  RAISE NOTICE '🔍 VERIFICANDO TABLAS DEL SISTEMA...';
  RAISE NOTICE '=====================================';
  
  FOREACH tabla_record.table_name IN ARRAY tablas_requeridas
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = tabla_record.table_name
    ) INTO tabla_existe;
    
    IF tabla_existe THEN
      RAISE NOTICE '✅ Tabla "%" existe', tabla_record.table_name;
    ELSE
      RAISE NOTICE '❌ Tabla "%" NO EXISTE', tabla_record.table_name;
    END IF;
  END LOOP;
END $$;

-- ================================
-- VERIFICAR FUNCIONES RLS
-- ================================

DO $$
DECLARE
  funcion_record RECORD;
  funciones_requeridas TEXT[] := ARRAY[
    'get_user_role', 'get_current_employee_id', 'is_user_active', 'has_module_permission'
  ];
  funcion_existe BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO FUNCIONES RLS...';
  RAISE NOTICE '===============================';
  
  FOREACH funcion_record.routine_name IN ARRAY funciones_requeridas
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = funcion_record.routine_name
      AND routine_type = 'FUNCTION'
    ) INTO funcion_existe;
    
    IF funcion_existe THEN
      RAISE NOTICE '✅ Función "%" existe', funcion_record.routine_name;
    ELSE
      RAISE NOTICE '❌ Función "%" NO EXISTE', funcion_record.routine_name;
    END IF;
  END LOOP;
END $$;

-- ================================
-- VERIFICAR EDGE FUNCTIONS
-- ================================

DO $$
DECLARE
  funcion_record RECORD;
  funciones_edge TEXT[] := ARRAY[
    'procesar_venta_completa', 'procesar_arqueo_caja', 'validar_stock_venta', 'get_ventas_analytics'
  ];
  funcion_existe BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO EDGE FUNCTIONS...';
  RAISE NOTICE '================================';
  
  FOREACH funcion_record.routine_name IN ARRAY funciones_edge
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = funcion_record.routine_name
      AND routine_type = 'FUNCTION'
    ) INTO funcion_existe;
    
    IF funcion_existe THEN
      RAISE NOTICE '✅ Edge Function "%" existe', funcion_record.routine_name;
    ELSE
      RAISE NOTICE '❌ Edge Function "%" NO EXISTE', funcion_record.routine_name;
    END IF;
  END LOOP;
END $$;

-- ================================
-- VERIFICAR COLUMNAS ESPECÍFICAS
-- ================================

DO $$
DECLARE
  columna_existe BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO COLUMNAS ESPECÍFICAS...';
  RAISE NOTICE '=====================================';
  
  -- Verificar columnas en movimientos_caja
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_id'
  ) INTO columna_existe;
  
  IF columna_existe THEN
    RAISE NOTICE '✅ Columna movimientos_caja.referencia_id existe';
  ELSE
    RAISE NOTICE '❌ Columna movimientos_caja.referencia_id NO EXISTE';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_tipo'
  ) INTO columna_existe;
  
  IF columna_existe THEN
    RAISE NOTICE '✅ Columna movimientos_caja.referencia_tipo existe';
  ELSE
    RAISE NOTICE '❌ Columna movimientos_caja.referencia_tipo NO EXISTE';
  END IF;
  
  -- Verificar columnas en empleados
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empleados' AND column_name = 'permisos_modulos'
  ) INTO columna_existe;
  
  IF columna_existe THEN
    RAISE NOTICE '✅ Columna empleados.permisos_modulos existe';
  ELSE
    RAISE NOTICE '❌ Columna empleados.permisos_modulos NO EXISTE';
  END IF;
END $$;

-- ================================
-- VERIFICAR POLÍTICAS RLS
-- ================================

DO $$
DECLARE
  tabla_record RECORD;
  rls_habilitado BOOLEAN;
  politicas_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO ROW LEVEL SECURITY...';
  RAISE NOTICE '===================================';
  
  -- Verificar RLS en tablas principales
  FOR tabla_record IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN ('empleados', 'productos', 'clientes', 'ventas', 'movimientos_caja', 'cajas_diarias', 'arqueos_caja')
  LOOP
    SELECT rowsecurity INTO rls_habilitado
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = tabla_record.tablename;
    
    SELECT COUNT(*) INTO politicas_count
    FROM pg_policies 
    WHERE tablename = tabla_record.tablename;
    
    IF rls_habilitado THEN
      RAISE NOTICE '✅ RLS habilitado en "%" (% políticas)', tabla_record.tablename, politicas_count;
    ELSE
      RAISE NOTICE '❌ RLS NO habilitado en "%"', tabla_record.tablename;
    END IF;
  END LOOP;
END $$;

-- ================================
-- VERIFICAR ÍNDICES IMPORTANTES
-- ================================

DO $$
DECLARE
  indice_record RECORD;
  indices_importantes TEXT[] := ARRAY[
    'idx_ventas_empleado_fecha', 'idx_movimientos_caja_empleado_fecha', 
    'idx_cajas_diarias_empleado_fecha', 'idx_productos_categoria'
  ];
  indice_existe BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO ÍNDICES IMPORTANTES...';
  RAISE NOTICE '====================================';
  
  FOREACH indice_record.indexname IN ARRAY indices_importantes
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = indice_record.indexname
    ) INTO indice_existe;
    
    IF indice_existe THEN
      RAISE NOTICE '✅ Índice "%" existe', indice_record.indexname;
    ELSE
      RAISE NOTICE '⚠️ Índice "%" NO existe (recomendado)', indice_record.indexname;
    END IF;
  END LOOP;
END $$;

-- ================================
-- VERIFICAR TRIGGERS
-- ================================

DO $$
DECLARE
  trigger_record RECORD;
  triggers_importantes TEXT[] := ARRAY[
    'update_cajas_diarias_updated_at', 'update_arqueos_caja_updated_at'
  ];
  trigger_existe BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICANDO TRIGGERS...';
  RAISE NOTICE '==========================';
  
  FOREACH trigger_record.trigger_name IN ARRAY triggers_importantes
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_schema = 'public' 
      AND trigger_name = trigger_record.trigger_name
    ) INTO trigger_existe;
    
    IF trigger_existe THEN
      RAISE NOTICE '✅ Trigger "%" existe', trigger_record.trigger_name;
    ELSE
      RAISE NOTICE '❌ Trigger "%" NO EXISTE', trigger_record.trigger_name;
    END IF;
  END LOOP;
END $$;

-- ================================
-- RESUMEN FINAL
-- ================================

DO $$
DECLARE
  total_tablas INTEGER;
  total_funciones INTEGER;
  total_politicas INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMEN DEL SISTEMA';
  RAISE NOTICE '=====================';
  
  SELECT COUNT(*) INTO total_tablas
  FROM information_schema.tables
  WHERE table_schema = 'public';
  
  SELECT COUNT(*) INTO total_funciones
  FROM information_schema.routines
  WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
  
  SELECT COUNT(*) INTO total_politicas
  FROM pg_policies;
  
  RAISE NOTICE 'Total de tablas: %', total_tablas;
  RAISE NOTICE 'Total de funciones: %', total_funciones;
  RAISE NOTICE 'Total de políticas RLS: %', total_politicas;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Verificación completada';
END $$;
