# 🚀 Configuración de Vercel - Motorepuestos FL

## 📋 Variables de Entorno para Vercel

### **1. Variables que debes configurar en Vercel:**

Ve a tu proyecto en Vercel y configura estas variables de entorno:

#### **Variables Obligatorias:**
```
REACT_APP_SUPABASE_URL=https://hsajhnxtlgfpkpzcrjyb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4
```

#### **Variables Opcionales:**
```
REACT_APP_APP_NAME=Motorepuestos FL
REACT_APP_APP_VERSION=1.0.0
REACT_APP_APP_ENV=production
REACT_APP_ANALYTICS_ID=your_analytics_id_here
```

## 🔧 Pasos para Configurar Vercel

### **1. Conectar Repositorio**
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en **"New Project"**
4. Conecta tu repositorio de GitHub/GitLab/Bitbucket
5. Selecciona el repositorio `Motorepuestos-FL`

### **2. Configurar Variables de Entorno**
1. En la configuración del proyecto, ve a **Settings > Environment Variables**
2. Agrega cada variable:

#### **Variable 1:**
- **Name:** `REACT_APP_SUPABASE_URL`
- **Value:** `https://hsajhnxtlgfpkpzcrjyb.supabase.co`
- **Environment:** Production, Preview, Development

#### **Variable 2:**
- **Name:** `REACT_APP_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4`
- **Environment:** Production, Preview, Development

#### **Variable 3:**
- **Name:** `REACT_APP_APP_NAME`
- **Value:** `Motorepuestos FL`
- **Environment:** Production, Preview, Development

#### **Variable 4:**
- **Name:** `REACT_APP_APP_VERSION`
- **Value:** `1.0.0`
- **Environment:** Production, Preview, Development

#### **Variable 5:**
- **Name:** `REACT_APP_APP_ENV`
- **Value:** `production`
- **Environment:** Production, Preview, Development

### **3. Configurar Build Settings**
1. Ve a **Settings > General**
2. Configura:
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

### **4. Configurar Dominio Personalizado (Opcional)**
1. Ve a **Settings > Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## 📦 Instalación Local de Dependencias

### **Antes de hacer push a Vercel, instala las dependencias localmente:**

#### **Opción 1: Instalación Manual**
```bash
# Cerrar todos los procesos de desarrollo
# Eliminar node_modules manualmente desde el explorador
# Luego ejecutar:
npm install
```

#### **Opción 2: Instalación con Flags**
```bash
npm install --legacy-peer-deps --no-optional
```

#### **Opción 3: Instalación Limpia**
```bash
# Limpiar cache
npm cache clean --force

# Instalar dependencias
npm install --legacy-peer-deps
```

### **Verificar Instalación:**
```bash
# Verificar que react-scripts está instalado
npm list react-scripts

# Verificar que todas las dependencias están instaladas
npm list --depth=0
```

## 🚀 Despliegue

### **1. Hacer Push al Repositorio**
```bash
git add .
git commit -m "feat: configuración completa para Vercel"
git push origin main
```

### **2. Vercel Despliegue Automático**
- Vercel detectará automáticamente los cambios
- Iniciará el proceso de build
- Desplegará la aplicación

### **3. Verificar Despliegue**
1. Ve a tu dashboard de Vercel
2. Revisa los logs de build
3. Verifica que la aplicación funciona correctamente

## 🔍 Verificación Post-Despliegue

### **1. Verificar Variables de Entorno**
1. Ve a **Settings > Environment Variables**
2. Confirma que todas las variables están configuradas
3. Verifica que están marcadas para todos los entornos

### **2. Verificar Funcionalidad**
1. Abre la URL de tu aplicación
2. Verifica que la autenticación funciona
3. Prueba crear un producto
4. Verifica que se conecta a Supabase

### **3. Verificar Logs**
1. Ve a **Functions > Logs**
2. Revisa si hay errores
3. Verifica que las variables se están leyendo correctamente

## 🛠️ Solución de Problemas

### **Error: "Build failed"**
1. Verificar que todas las variables de entorno están configuradas
2. Revisar los logs de build en Vercel
3. Verificar que el package.json está correcto

### **Error: "Environment variables not found"**
1. Verificar que las variables están configuradas en Vercel
2. Verificar que están marcadas para el entorno correcto
3. Hacer redeploy después de agregar variables

### **Error: "Supabase connection failed"**
1. Verificar URL y API Key en las variables de entorno
2. Verificar que las políticas RLS están configuradas en Supabase
3. Verificar que las tablas existen

## 📊 Monitoreo

### **1. Analytics de Vercel**
- Ve a **Analytics** en tu dashboard
- Revisa métricas de rendimiento
- Monitorea errores

### **2. Logs de Supabase**
- Ve a tu proyecto de Supabase
- Revisa **Logs** para errores de conexión
- Monitorea el uso de la API

---

## 🎯 Resumen de Configuración

### **Variables de Entorno Configuradas:**
- ✅ `REACT_APP_SUPABASE_URL`
- ✅ `REACT_APP_SUPABASE_ANON_KEY`
- ✅ `REACT_APP_APP_NAME`
- ✅ `REACT_APP_APP_VERSION`
- ✅ `REACT_APP_APP_ENV`

### **Archivos de Configuración:**
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `package.json` - Dependencias y scripts
- ✅ `env.local` - Variables locales

### **Próximos Pasos:**
1. Instalar dependencias localmente
2. Hacer push al repositorio
3. Configurar variables en Vercel
4. Verificar despliegue

**🏍️ ¡Tu aplicación estará lista para producción!**
