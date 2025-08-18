-- Script para configurar AFIP con datos reales de producción
-- IMPORTANTE: Reemplaza los valores con tus datos reales

-- 1. Actualizar configuración AFIP con datos reales
UPDATE configuracion_afip 
SET 
    cuit = 'TU_CUIT_REAL', -- Reemplaza con tu CUIT real (ej: 20123456789)
    punto_venta = 1, -- Reemplaza con tu punto de venta real
    condicion_iva = 'Responsable Inscripto', -- O la condición que corresponda
    ambiente = 'production', -- Cambiar de 'testing' a 'production'
    certificado_path = '/ruta/al/certificado.crt', -- Ruta al certificado descargado
    clave_privada_path = '/ruta/a/la/clave.key', -- Ruta a la clave privada
    updated_at = NOW()
WHERE activo = true;

-- 2. Si no existe configuración, crear una nueva
INSERT INTO configuracion_afip (
    cuit, 
    punto_venta, 
    condicion_iva, 
    ambiente, 
    certificado_path, 
    clave_privada_path
) 
SELECT 
    'TU_CUIT_REAL', -- Reemplaza con tu CUIT real
    1, -- Reemplaza con tu punto de venta real
    'Responsable Inscripto', -- O la condición que corresponda
    'production', -- Ambiente de producción
    '/ruta/al/certificado.crt', -- Ruta al certificado
    '/ruta/a/la/clave.key' -- Ruta a la clave privada
WHERE NOT EXISTS (
    SELECT 1 FROM configuracion_afip WHERE activo = true
);

-- 3. Verificar la configuración actualizada
SELECT 
    'Configuración AFIP actualizada para producción' as mensaje,
    cuit,
    punto_venta,
    condicion_iva,
    ambiente,
    certificado_path,
    activo,
    created_at,
    updated_at
FROM configuracion_afip 
WHERE activo = true;
