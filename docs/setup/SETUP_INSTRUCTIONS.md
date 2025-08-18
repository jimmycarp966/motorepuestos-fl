# 🚀 Instrucciones de Configuración - Motorepuestos FL

## 📋 Pasos para Configurar el Sistema

### **1. Configurar Supabase**

#### **A. Ejecutar Script SQL Principal**
1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: `hsajhnxtlgfpkpzcrjyb`
3. Ve a **SQL Editor**
4. Copia y pega el contenido del archivo `supabase-setup.sql`
5. Ejecuta el script completo

#### **B. Si hay errores de triggers duplicados**
Si ves errores como `"trigger already exists"`, ejecuta el script de limpieza:
1. En **SQL Editor**, copia y pega el contenido de `fix-rls-policies.sql`
2. Ejecuta este script de limpieza
3. Luego vuelve a ejecutar `supabase-setup.sql`

#### **C. Verificar Variables de Entorno**
El archivo `env.local` ya está configurado con tus credenciales:
```
REACT_APP_SUPABASE_URL=https://hsajhnxtlgfpkpzcrjyb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Instalar Dependencias**

#### **Opción A: Instalación Normal**
```bash
npm install
```

#### **Opción B: Si hay problemas con node_modules**
```bash
# Cerrar todos los procesos de desarrollo
# Eliminar node_modules manualmente desde el explorador
# Luego ejecutar:
npm install --legacy-peer-deps
```

#### **Opción C: Instalación Limpia**
```bash
# Limpiar cache
npm cache clean --force

# Instalar con flags específicos
npm install --no-optional --legacy-peer-deps
```

### **3. Ejecutar el Proyecto**

```bash
npm start
```

El proyecto debería abrirse en: `http://localhost:3000`

### **4. Crear Usuario Administrador**

1. Ve a **Authentication > Users** en Supabase
2. Crea un nuevo usuario o usa el existente
3. El email `admin@motorepuestos.com` ya está configurado en la base de datos

### **5. Verificar Configuración**

#### **A. Verificar Tablas Creadas**
En Supabase > Table Editor, deberías ver:
- ✅ `productos`
- ✅ `clientes`
- ✅ `empleados`
- ✅ `ventas`
- ✅ `venta_items`
- ✅ `movimientos_caja`

#### **B. Verificar Datos de Ejemplo**
Deberías ver productos de ejemplo como:
- Aceite de Motor 4T
- Freno de Disco Delantero
- Bujía NGK
- etc.

## 🔧 Solución de Problemas

### **Error: "trigger already exists"**
```sql
-- Ejecutar este script de limpieza:
-- Copia y pega el contenido de fix-rls-policies.sql
-- Luego ejecuta supabase-setup.sql nuevamente
```

### **Error: "react-scripts" no se reconoce**
```bash
# Reinstalar react-scripts específicamente
npm install react-scripts@5.0.1
```

### **Error: EBUSY resource busy**
```bash
# Cerrar todos los procesos de desarrollo
# Reiniciar terminal
# Intentar instalación nuevamente
```

### **Error: Variables de entorno no encontradas**
```bash
# Verificar que el archivo env.local existe
# Reiniciar el servidor de desarrollo
npm start
```

### **Error: Conexión a Supabase**
1. Verificar URL y API Key en `env.local`
2. Verificar que las políticas RLS están configuradas
3. Verificar que las tablas existen

## 📊 Estructura del Sistema

### **Módulos Disponibles:**
- 🏠 **Dashboard** - KPIs y métricas
- 📦 **Productos** - Gestión de inventario
- 🛒 **Ventas** - Registro de ventas
- 💰 **Caja** - Control de movimientos
- 👥 **Clientes** - Base de datos de clientes
- 👨‍💼 **Empleados** - Gestión de personal
- 📈 **Reportes** - Análisis y estadísticas

### **Categorías de Productos:**
- Motores, Frenos, Suspensión
- Eléctrico, Combustible, Transmisión
- Carrocería, Accesorios, Lubricantes
- Herramientas, Neumáticos, Iluminación
- Audio, Seguridad, Otros

## 🎨 Características del Diseño

### **Colores Implementados:**
- **Azul Principal:** `#3b82f6`
- **Azul Claro:** `#60a5fa`
- **Azul Muy Claro:** `#93c5fd`
- **Degradados:** `gradient-moto`, `gradient-moto-dark`

### **Componentes Modernos:**
- Interfaz responsive
- Animaciones suaves
- Diseño táctil optimizado
- Notificaciones en tiempo real

## 🚀 Despliegue

### **Para Vercel:**
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### **Para Netlify:**
1. Conectar repositorio a Netlify
2. Configurar build settings
3. Configurar variables de entorno

## 📞 Soporte

### **Si tienes problemas:**
1. Verificar que todas las tablas están creadas
2. Verificar que las políticas RLS están activas
3. Verificar que las variables de entorno están correctas
4. Revisar la consola del navegador para errores

### **Logs Útiles:**
- Consola del navegador (F12)
- Logs de Supabase
- Terminal de desarrollo

---

## 🎯 Resumen de Configuración

### **Scripts SQL Disponibles:**
- ✅ `supabase-setup.sql` - Configuración principal
- ✅ `fix-rls-policies.sql` - Limpieza y reparación

### **Variables de Entorno:**
- ✅ `env.local` - Variables locales configuradas
- ✅ `VERCEL_SETUP.md` - Configuración para Vercel

### **Próximos Pasos:**
1. Ejecutar `supabase-setup.sql` en Supabase
2. Si hay errores, ejecutar `fix-rls-policies.sql`
3. Instalar dependencias localmente
4. Ejecutar `npm start`

**🏍️ ¡El sistema está listo para usar!**

Una vez configurado, podrás:
- Registrar productos de motorepuestos
- Gestionar clientes y empleados
- Realizar ventas con múltiples productos
- Controlar caja y movimientos
- Generar reportes y estadísticas
