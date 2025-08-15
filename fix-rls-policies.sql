-- Script para corregir las políticas RLS
-- Ejecutar en el SQL Editor de Supabase

-- 1. Deshabilitar RLS temporalmente para empleados
ALTER TABLE empleados DISABLE ROW LEVEL SECURITY;

-- 2. Insertar empleado de prueba
INSERT INTO empleados (nombre, email, rol, activo) 
VALUES ('Usuario de Prueba', 'test@motorepuestos.com', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- 3. Habilitar RLS nuevamente
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

-- 4. Corregir la política para evitar recursión infinita
DROP POLICY IF EXISTS "Admin can manage empleados" ON empleados;

CREATE POLICY "Admin can manage empleados" ON empleados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados e 
            WHERE e.email = current_user 
            AND e.rol = 'admin' 
            AND e.activo = true
            AND e.id != empleados.id  -- Evitar recursión
        )
    );

-- 5. Verificar que se creó correctamente
SELECT * FROM empleados WHERE email = 'test@motorepuestos.com';

-- 6. Mostrar mensaje de éxito
SELECT 
  '✅ Usuario de prueba creado exitosamente!' as mensaje,
  '📧 Email: test@motorepuestos.com' as email,
  '🔑 Contraseña: 123456' as password,
  '👤 Rol: admin (acceso completo)' as rol;
