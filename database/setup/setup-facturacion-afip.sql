-- Script para configurar facturación electrónica AFIP
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla para configuración AFIP
CREATE TABLE IF NOT EXISTS configuracion_afip (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cuit VARCHAR(11) NOT NULL,
    punto_venta INTEGER NOT NULL DEFAULT 1,
    condicion_iva VARCHAR(50) NOT NULL DEFAULT 'Responsable Inscripto',
    ambiente VARCHAR(20) NOT NULL DEFAULT 'testing', -- testing o production
    certificado_path TEXT,
    clave_privada_path TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla para comprobantes electrónicos
CREATE TABLE IF NOT EXISTS comprobantes_electronicos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    tipo_comprobante VARCHAR(10) NOT NULL, -- A, B, C, E, M
    punto_venta INTEGER NOT NULL,
    numero_comprobante INTEGER NOT NULL,
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    cae VARCHAR(14), -- Código de Autorización Electrónico
    cae_vto TIMESTAMP WITH TIME ZONE, -- Vencimiento CAE
    resultado VARCHAR(10), -- A (Aprobado), R (Rechazado), P (Pendiente)
    motivo_rechazo TEXT,
    observaciones TEXT,
    xml_request TEXT, -- XML enviado a AFIP
    xml_response TEXT, -- XML recibido de AFIP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venta_id, tipo_comprobante)
);

-- 3. Tabla para tipos de comprobantes
CREATE TABLE IF NOT EXISTS tipos_comprobante (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla para condiciones IVA
CREATE TABLE IF NOT EXISTS condiciones_iva (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo INTEGER NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla para conceptos
CREATE TABLE IF NOT EXISTS conceptos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo INTEGER NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla para tipos de documento
CREATE TABLE IF NOT EXISTS tipos_documento (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo INTEGER NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla para alícuotas IVA
CREATE TABLE IF NOT EXISTS alicuotas_iva (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo INTEGER NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabla para monedas
CREATE TABLE IF NOT EXISTS monedas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL UNIQUE,
    descripcion VARCHAR(100) NOT NULL,
    cotizacion DECIMAL(10,4) DEFAULT 1.0000,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Insertar datos básicos de AFIP
INSERT INTO tipos_comprobante (codigo, descripcion) VALUES
('A', 'Factura A'),
('B', 'Factura B'),
('C', 'Factura C'),
('E', 'Nota de Crédito E'),
('M', 'Nota de Débito M')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO condiciones_iva (codigo, descripcion) VALUES
(1, 'IVA Responsable Inscripto'),
(2, 'IVA Responsable no Inscripto'),
(3, 'IVA no Responsable'),
(4, 'IVA Sujeto Exento'),
(5, 'Consumidor Final'),
(6, 'Responsable Monotributista'),
(7, 'Sujeto no Categorizado'),
(8, 'Proveedor del Exterior'),
(9, 'Cliente del Exterior'),
(10, 'IVA Liberado - Ley Nº 19.640'),
(11, 'IVA Responsable Inscripto - Agente de Percepción'),
(12, 'Pequeño Contribuyente Eventual'),
(13, 'Monotributista Social'),
(14, 'Pequeño Contribuyente Eventual Social')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO conceptos (codigo, descripcion) VALUES
(1, 'Productos'),
(2, 'Servicios'),
(3, 'Productos y Servicios')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tipos_documento (codigo, descripcion) VALUES
(80, 'CUIT'),
(86, 'CUIL'),
(87, 'CDI'),
(89, 'LE'),
(90, 'LC'),
(91, 'CI Extranjera'),
(92, 'En Trámite'),
(93, 'Acta Nacimiento'),
(94, 'Pasaporte'),
(95, 'CI Bs. As. RNP'),
(96, 'DNI'),
(99, 'Sin Calificar')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO alicuotas_iva (codigo, descripcion, porcentaje) VALUES
(1, 'No Gravado', 0.00),
(2, 'Exento', 0.00),
(3, '0%', 0.00),
(4, '10.5%', 10.50),
(5, '21%', 21.00),
(6, '27%', 27.00),
(8, '5%', 5.00),
(9, '2.5%', 2.50)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO monedas (codigo, descripcion) VALUES
('PES', 'Pesos Argentinos'),
('DOL', 'Dólar Estadounidense'),
('EUR', 'Euro'),
('BRL', 'Real Brasileño')
ON CONFLICT (codigo) DO NOTHING;

-- 10. Insertar configuración por defecto (testing)
INSERT INTO configuracion_afip (cuit, punto_venta, condicion_iva, ambiente) VALUES
('20111111111', 1, 'Responsable Inscripto', 'testing')
ON CONFLICT DO NOTHING;

-- 11. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_comprobantes_venta_id ON comprobantes_electronicos(venta_id);
CREATE INDEX IF NOT EXISTS idx_comprobantes_cae ON comprobantes_electronicos(cae);
CREATE INDEX IF NOT EXISTS idx_comprobantes_fecha ON comprobantes_electronicos(fecha_emision);

-- 12. Habilitar RLS
ALTER TABLE configuracion_afip ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes_electronicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_comprobante ENABLE ROW LEVEL SECURITY;
ALTER TABLE condiciones_iva ENABLE ROW LEVEL SECURITY;
ALTER TABLE conceptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE alicuotas_iva ENABLE ROW LEVEL SECURITY;
ALTER TABLE monedas ENABLE ROW LEVEL SECURITY;

-- 13. Crear políticas RLS
CREATE POLICY "Configuracion AFIP visible para usuarios autenticados" ON configuracion_afip
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Comprobantes visibles para usuarios autenticados" ON comprobantes_electronicos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Comprobantes editables para usuarios autenticados" ON comprobantes_electronicos
    FOR ALL USING (auth.role() = 'authenticated');

-- 14. Verificar la configuración
SELECT 
    'Configuración AFIP creada exitosamente' as mensaje,
    COUNT(*) as total_tipos_comprobante,
    (SELECT COUNT(*) FROM condiciones_iva) as total_condiciones_iva,
    (SELECT COUNT(*) FROM alicuotas_iva) as total_alicuotas_iva
FROM tipos_comprobante;
