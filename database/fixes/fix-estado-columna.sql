-- ================================================
-- FIX ESPECÍFICO PARA ERROR DE COLUMNA "estado"
-- ================================================
-- Script para resolver el error: column "estado" does not exist

-- ================================
-- VERIFICAR Y REPARAR TABLA CAJAS_DIARIAS
-- ================================

DO $$
DECLARE
  tabla_existe BOOLEAN;
  columna_existe BOOLEAN;
BEGIN
  -- Verificar si la tabla existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'cajas_diarias'
  ) INTO tabla_existe;
  
  IF tabla_existe THEN
    RAISE NOTICE '✅ Tabla cajas_diarias existe';
    
    -- Verificar si la columna estado existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'cajas_diarias' AND column_name = 'estado'
    ) INTO columna_existe;
    
    IF columna_existe THEN
      RAISE NOTICE '✅ Columna estado existe en cajas_diarias';
    ELSE
      RAISE NOTICE '❌ Columna estado NO existe en cajas_diarias - agregando...';
      -- Agregar la columna estado
      ALTER TABLE cajas_diarias ADD COLUMN estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada'));
      RAISE NOTICE '✅ Columna estado agregada a cajas_diarias';
    END IF;
    
  ELSE
    RAISE NOTICE '❌ Tabla cajas_diarias NO existe - creando...';
    
    -- Crear la tabla completa
    CREATE TABLE cajas_diarias (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      empleado_id UUID NOT NULL REFERENCES empleados(id),
      fecha DATE NOT NULL,
      saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
      saldo_final DECIMAL(10,2),
      total_ingresos DECIMAL(10,2) DEFAULT 0,
      total_egresos DECIMAL(10,2) DEFAULT 0,
      diferencia DECIMAL(10,2) DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
      arqueo_id UUID, -- Sin REFERENCES inicialmente para evitar dependencias circulares
      observaciones TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      UNIQUE(empleado_id, fecha),
      CHECK (saldo_inicial >= 0),
      CHECK (saldo_final IS NULL OR saldo_final >= 0)
    );
    
    RAISE NOTICE '✅ Tabla cajas_diarias creada con columna estado';
  END IF;
END $$;

-- ================================
-- VERIFICAR Y REPARAR TABLA ARQUEOS_CAJA
-- ================================

DO $$
DECLARE
  tabla_existe BOOLEAN;
  columna_existe BOOLEAN;
BEGIN
  -- Verificar si la tabla existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'arqueos_caja'
  ) INTO tabla_existe;
  
  IF tabla_existe THEN
    RAISE NOTICE '✅ Tabla arqueos_caja existe';
    
    -- Verificar si la columna estado existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'arqueos_caja' AND column_name = 'estado'
    ) INTO columna_existe;
    
    IF columna_existe THEN
      RAISE NOTICE '✅ Columna estado existe en arqueos_caja';
    ELSE
      RAISE NOTICE '❌ Columna estado NO existe en arqueos_caja - agregando...';
      -- Agregar la columna estado
      ALTER TABLE arqueos_caja ADD COLUMN estado TEXT NOT NULL DEFAULT 'cuadrado' CHECK (estado IN ('cuadrado', 'sobrante', 'faltante'));
      RAISE NOTICE '✅ Columna estado agregada a arqueos_caja';
    END IF;
    
  ELSE
    RAISE NOTICE '❌ Tabla arqueos_caja NO existe - creando...';
    
    -- Crear la tabla completa
    CREATE TABLE arqueos_caja (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      empleado_id UUID NOT NULL REFERENCES empleados(id),
      fecha DATE NOT NULL,
      saldo_inicial DECIMAL(10,2) NOT NULL,
      total_ingresos DECIMAL(10,2) NOT NULL DEFAULT 0,
      total_egresos DECIMAL(10,2) NOT NULL DEFAULT 0,
      saldo_teorico DECIMAL(10,2) NOT NULL,
      monto_contado DECIMAL(10,2) NOT NULL,
      diferencia DECIMAL(10,2) NOT NULL,
      estado TEXT NOT NULL DEFAULT 'cuadrado' CHECK (estado IN ('cuadrado', 'sobrante', 'faltante')),
      observaciones TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      UNIQUE(empleado_id, fecha),
      CHECK (saldo_inicial >= 0),
      CHECK (total_ingresos >= 0),
      CHECK (total_egresos >= 0),
      CHECK (monto_contado >= 0)
    );
    
    RAISE NOTICE '✅ Tabla arqueos_caja creada con columna estado';
  END IF;
END $$;

-- ================================
-- AGREGAR REFERENCIA FOREIGN KEY DESPUÉS
-- ================================

DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  -- Verificar si la constraint ya existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'cajas_diarias' 
    AND constraint_name LIKE '%arqueo_id%'
    AND constraint_type = 'FOREIGN KEY'
  ) INTO constraint_exists;
  
  IF NOT constraint_exists THEN
    -- Agregar la foreign key constraint
    ALTER TABLE cajas_diarias 
    ADD CONSTRAINT fk_cajas_diarias_arqueo_id 
    FOREIGN KEY (arqueo_id) REFERENCES arqueos_caja(id);
    
    RAISE NOTICE '✅ Foreign key constraint agregada entre cajas_diarias y arqueos_caja';
  ELSE
    RAISE NOTICE '✅ Foreign key constraint ya existe';
  END IF;
END $$;

-- ================================
-- VERIFICAR COLUMNAS EN MOVIMIENTOS_CAJA
-- ================================

DO $$
DECLARE
  columna_ref_id BOOLEAN;
  columna_ref_tipo BOOLEAN;
BEGIN
  -- Verificar referencia_id
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_id'
  ) INTO columna_ref_id;
  
  -- Verificar referencia_tipo
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_tipo'
  ) INTO columna_ref_tipo;
  
  IF NOT columna_ref_id THEN
    ALTER TABLE movimientos_caja ADD COLUMN referencia_id UUID;
    RAISE NOTICE '✅ Agregada columna referencia_id a movimientos_caja';
  ELSE
    RAISE NOTICE '✅ Columna referencia_id ya existe en movimientos_caja';
  END IF;
  
  IF NOT columna_ref_tipo THEN
    ALTER TABLE movimientos_caja ADD COLUMN referencia_tipo TEXT;
    RAISE NOTICE '✅ Agregada columna referencia_tipo a movimientos_caja';
  ELSE
    RAISE NOTICE '✅ Columna referencia_tipo ya existe en movimientos_caja';
  END IF;
END $$;

-- ================================
-- VERIFICAR OTRAS TABLAS NECESARIAS
-- ================================

-- Crear error_log si no existe
CREATE TABLE IF NOT EXISTS error_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcion TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  empleado_id UUID REFERENCES empleados(id),
  parametros JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear audit_log si no existe
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tabla TEXT NOT NULL,
  accion TEXT NOT NULL,
  registro_id UUID,
  empleado_id UUID REFERENCES empleados(id),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear notificaciones_sistema si no existe
CREATE TABLE IF NOT EXISTS notificaciones_sistema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'warning', 'error', 'success')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  categoria TEXT NOT NULL,
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  empleado_id UUID REFERENCES empleados(id),
  leida BOOLEAN DEFAULT false,
  datos_contexto JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ================================
-- VERIFICACIÓN FINAL DETALLADA
-- ================================

DO $$
DECLARE
  cajas_estado BOOLEAN;
  arqueos_estado BOOLEAN;
  movimientos_ref_id BOOLEAN;
  movimientos_ref_tipo BOOLEAN;
BEGIN
  -- Verificar todas las columnas necesarias
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cajas_diarias' AND column_name = 'estado'
  ) INTO cajas_estado;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'arqueos_caja' AND column_name = 'estado'
  ) INTO arqueos_estado;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_id'
  ) INTO movimientos_ref_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimientos_caja' AND column_name = 'referencia_tipo'
  ) INTO movimientos_ref_tipo;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 VERIFICACIÓN FINAL DE COLUMNAS';
  RAISE NOTICE '==================================';
  RAISE NOTICE 'cajas_diarias.estado: %', CASE WHEN cajas_estado THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'arqueos_caja.estado: %', CASE WHEN arqueos_estado THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'movimientos_caja.referencia_id: %', CASE WHEN movimientos_ref_id THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'movimientos_caja.referencia_tipo: %', CASE WHEN movimientos_ref_tipo THEN '✅' ELSE '❌' END;
  
  IF cajas_estado AND arqueos_estado AND movimientos_ref_id AND movimientos_ref_tipo THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TODAS LAS COLUMNAS ESTÁN DISPONIBLES';
    RAISE NOTICE '✅ Ahora puedes ejecutar las Edge Functions sin errores';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ ALGUNAS COLUMNAS FALTAN - revisar errores arriba';
  END IF;
END $$;
