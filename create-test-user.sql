-- Script SQL para crear usuario de prueba
-- Ejecutar en el SQL Editor de Supabase

-- 1. Insertar empleado de prueba
INSERT INTO empleados (nombre, email, rol, activo) 
VALUES ('Usuario de Prueba', 'test@motorepuestos.com', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- 2. Verificar que se creó correctamente
SELECT * FROM empleados WHERE email = 'test@motorepuestos.com';

-- 3. Mostrar mensaje de éxito
SELECT 
  '✅ Usuario de prueba creado exitosamente!' as mensaje,
  '📧 Email: test@motorepuestos.com' as email,
  '🔑 Contraseña: 123456' as password,
  '👤 Rol: admin (acceso completo)' as rol;
