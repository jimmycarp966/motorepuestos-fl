-- Script para actualizar la tabla empleados con nuevos campos
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar nuevos campos a la tabla empleados
ALTER TABLE empleados 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS salario DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS permisos_modulos TEXT[] DEFAULT ARRAY['dashboard']::TEXT[];

-- 2. Actualizar empleados existentes con permisos por defecto basados en su rol
UPDATE empleados 
SET permisos_modulos = CASE 
  WHEN rol = 'Administrador' THEN ARRAY['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario']::TEXT[]
  WHEN rol = 'Gerente' THEN ARRAY['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario']::TEXT[]
  WHEN rol = 'Vendedor' THEN ARRAY['dashboard', 'ventas', 'clientes', 'calendario']::TEXT[]
  WHEN rol = 'Técnico' THEN ARRAY['dashboard', 'productos', 'calendario']::TEXT[]
  WHEN rol = 'Almacén' THEN ARRAY['dashboard', 'productos', 'calendario']::TEXT[]
  WHEN rol = 'Cajero' THEN ARRAY['dashboard', 'ventas', 'caja', 'clientes', 'calendario']::TEXT[]
  ELSE ARRAY['dashboard']::TEXT[]
END
WHERE permisos_modulos IS NULL OR array_length(permisos_modulos, 1) IS NULL;

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_empleados_rol ON empleados(rol);
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON empleados(activo);
CREATE INDEX IF NOT EXISTS idx_empleados_permisos ON empleados USING GIN(permisos_modulos);

-- 4. Actualizar RLS policies para incluir los nuevos campos
DROP POLICY IF EXISTS "Empleados pueden ver su propia información" ON empleados;
CREATE POLICY "Empleados pueden ver su propia información" ON empleados
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Administradores pueden gestionar empleados" ON empleados;
CREATE POLICY "Administradores pueden gestionar empleados" ON empleados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM empleados 
      WHERE id = auth.uid() 
      AND rol IN ('Administrador', 'Gerente')
    )
  );

-- 5. Crear función para validar permisos de módulos
CREATE OR REPLACE FUNCTION validar_permisos_modulos()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que los permisos sean válidos
  IF NEW.permisos_modulos IS NOT NULL THEN
    -- Verificar que todos los módulos sean válidos
    IF EXISTS (
      SELECT 1 FROM unnest(NEW.permisos_modulos) AS modulo
      WHERE modulo NOT IN ('dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario')
    ) THEN
      RAISE EXCEPTION 'Módulo no válido en permisos_modulos';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para validar permisos
DROP TRIGGER IF EXISTS trigger_validar_permisos_modulos ON empleados;
CREATE TRIGGER trigger_validar_permisos_modulos
  BEFORE INSERT OR UPDATE ON empleados
  FOR EACH ROW
  EXECUTE FUNCTION validar_permisos_modulos();

-- 7. Crear función para obtener permisos de usuario
CREATE OR REPLACE FUNCTION obtener_permisos_usuario(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  permisos TEXT[];
BEGIN
  SELECT permisos_modulos INTO permisos
  FROM empleados
  WHERE id = user_id AND activo = true;
  
  RETURN COALESCE(permisos, ARRAY['dashboard']::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Comentarios para documentar los cambios
COMMENT ON COLUMN empleados.password_hash IS 'Hash de la contraseña del empleado (para compatibilidad con auth.users)';
COMMENT ON COLUMN empleados.salario IS 'Salario mensual del empleado en pesos argentinos';
COMMENT ON COLUMN empleados.permisos_modulos IS 'Array de módulos a los que tiene acceso el empleado';

-- 9. Verificar que los cambios se aplicaron correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'empleados' 
AND column_name IN ('password_hash', 'salario', 'permisos_modulos')
ORDER BY column_name;

-- 10. Mostrar empleados con sus nuevos permisos
SELECT 
  id,
  nombre,
  email,
  rol,
  salario,
  permisos_modulos,
  activo
FROM empleados
ORDER BY nombre;
