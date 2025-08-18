# 🏛️ Configuración AFIP para Producción

## 📋 **Pasos para Configurar Datos Reales**

### **1. Obtener Credenciales de AFIP**

#### **A. Acceder a ARCA (Nuevo sistema de AFIP)**
1. Ve a: https://www.arca.gob.ar/ws
2. Inicia sesión con tu Clave Fiscal
3. Navega a "Web Services"

#### **B. Solicitar Acceso a Facturación Electrónica**
1. Busca "Facturación Electrónica" o "wsfev1"
2. Solicita el acceso al Web Service
3. Espera la aprobación (puede tomar 24-48 horas)

#### **C. Descargar Certificados**
1. Una vez aprobado, descarga:
   - **Certificado digital** (archivo `.crt`)
   - **Clave privada** (archivo `.key`)
2. Guárdalos en un lugar seguro

---

### **2. Configurar Variables de Entorno**

#### **A. En Vercel (Recomendado)**
Ve a tu proyecto en Vercel → Settings → Environment Variables:

```bash
# Variables requeridas
AFIP_CERTIFICATE_CONTENT="-----BEGIN CERTIFICATE-----
TU_CERTIFICADO_AQUI
-----END CERTIFICATE-----"

AFIP_PRIVATE_KEY_CONTENT="-----BEGIN PRIVATE KEY-----
TU_CLAVE_PRIVADA_AQUI
-----END PRIVATE KEY-----"

# Variables opcionales
AFIP_CUIT="20123456789"
AFIP_PUNTO_VENTA="1"
AFIP_AMBIENTE="production"
```

#### **B. En Desarrollo Local (.env.local)**
```bash
AFIP_CERTIFICATE_CONTENT="contenido_del_certificado"
AFIP_PRIVATE_KEY_CONTENT="contenido_de_la_clave_privada"
AFIP_CUIT="20123456789"
AFIP_PUNTO_VENTA="1"
AFIP_AMBIENTE="production"
```

---

### **3. Ejecutar Script de Configuración**

#### **A. En Supabase SQL Editor**
Ejecuta el archivo `configurar-afip-produccion.sql`:

```sql
-- Reemplaza estos valores con tus datos reales
UPDATE configuracion_afip 
SET 
    cuit = '20123456789', -- Tu CUIT real
    punto_venta = 1, -- Tu punto de venta
    condicion_iva = 'Responsable Inscripto', -- Tu condición IVA
    ambiente = 'production', -- Cambiar a producción
    updated_at = NOW()
WHERE activo = true;
```

#### **B. Verificar Configuración**
```sql
SELECT 
    cuit,
    punto_venta,
    condicion_iva,
    ambiente,
    activo
FROM configuracion_afip 
WHERE activo = true;
```

---

### **4. Actualizar el Servicio AFIP**

#### **A. Modificar la Configuración**
En `src/lib/afipService.ts`, actualiza la instancia:

```typescript
export function getAFIPService(): AFIPService {
  if (!afipServiceInstance) {
    afipServiceInstance = new AFIPService({
      cuit: process.env.AFIP_CUIT || '20123456789',
      puntoVenta: parseInt(process.env.AFIP_PUNTO_VENTA || '1'),
      ambiente: (process.env.AFIP_AMBIENTE as 'testing' | 'production') || 'production'
    });
  }
  return afipServiceInstance;
}
```

---

### **5. Probar la Configuración**

#### **A. Verificar Conectividad**
1. Ve a la aplicación
2. Intenta generar una factura de prueba
3. Verifica que no haya errores de certificado

#### **B. Generar Factura de Prueba**
1. Agrega productos al carrito
2. Haz clic en "Facturar AFIP"
3. Completa los datos
4. Genera la factura

---

## 🔒 **Seguridad y Mejores Prácticas**

### **A. Manejo de Certificados**
- ✅ **Nunca** subas certificados al repositorio
- ✅ Usa variables de entorno para almacenar certificados
- ✅ Rota los certificados regularmente
- ✅ Mantén backups seguros de los certificados

### **B. Variables de Entorno**
- ✅ Usa nombres descriptivos para las variables
- ✅ Documenta todas las variables requeridas
- ✅ Usa diferentes valores para desarrollo y producción

### **C. Validaciones**
- ✅ Verifica que el CUIT esté habilitado para facturación
- ✅ Confirma que el punto de venta esté activo
- ✅ Valida que los certificados no hayan expirado

---

## 🛠️ **Solución de Problemas**

### **Error: "Certificados no configurados"**
**Solución:**
1. Verifica que las variables de entorno estén configuradas
2. Confirma que los certificados estén en el formato correcto
3. Reinicia la aplicación después de cambiar variables

### **Error: "CUIT no autorizado"**
**Solución:**
1. Verifica que el CUIT esté habilitado en AFIP
2. Confirma que tengas acceso al Web Service
3. Revisa que el punto de venta esté activo

### **Error: "Certificado expirado"**
**Solución:**
1. Descarga nuevos certificados de AFIP
2. Actualiza las variables de entorno
3. Verifica la fecha de vencimiento

---

## 📞 **Soporte AFIP**

### **Contactos Útiles**
- **ARCA:** https://www.arca.gob.ar/ws
- **Documentación:** https://www.afip.gob.ar/ws/documentacion/
- **Soporte Técnico:** https://www.afip.gob.ar/contacto/

### **Horarios de Soporte**
- **Lunes a Viernes:** 8:00 a 20:00 hs
- **Sábados:** 9:00 a 14:00 hs

---

## ✅ **Checklist de Configuración**

- [ ] Obtener acceso a Web Services en ARCA
- [ ] Descargar certificado digital (.crt)
- [ ] Descargar clave privada (.key)
- [ ] Configurar variables de entorno
- [ ] Ejecutar script de configuración SQL
- [ ] Actualizar servicio AFIP
- [ ] Probar facturación de prueba
- [ ] Verificar conectividad con AFIP
- [ ] Documentar configuración
- [ ] Configurar monitoreo y alertas

---

## 🎯 **Estado Final**

Una vez completados todos los pasos, tu aplicación estará configurada para:

- ✅ Generar facturas electrónicas reales
- ✅ Conectarse con los servidores de producción de AFIP
- ✅ Usar tu CUIT y punto de venta reales
- ✅ Manejar certificados de forma segura
- ✅ Operar en ambiente de producción

**¡Tu sistema estará listo para facturación electrónica real!** 🎉
