# 🚀 Configuración de Variables de Entorno en Vercel

## 📋 Variables Obligatorias (Copiar y Pegar)

### **1. VITE_SUPABASE_URL**
```
Name: VITE_SUPABASE_URL
Value: https://hsajhnxtlgfpkpzcrjyb.supabase.co
Environment: Production, Preview, Development
```

### **2. VITE_SUPABASE_ANON_KEY**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4
Environment: Production, Preview, Development
```

### **3. VITE_SUPABASE_SERVICE_ROLE_KEY**
```
Name: VITE_SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1NzY0NSwiZXhwIjoyMDcwODMzNjQ1fQ.Z_KzATN2NK9cvxAJMokNjtwhN1VWAUQH6Ezl_2-zFiU
Environment: Production, Preview, Development
```

## 📋 Variables Recomendadas

### **4. VITE_APP_NAME**
```
Name: VITE_APP_NAME
Value: Motorepuestos FL
Environment: Production, Preview, Development
```

### **5. VITE_APP_VERSION**
```
Name: VITE_APP_VERSION
Value: 1.0.0
Environment: Production, Preview, Development
```

### **6. VITE_APP_ENV**
```
Name: VITE_APP_ENV
Value: production
Environment: Production, Preview, Development
```

## 🔧 Pasos en Vercel Dashboard

### **Paso 1: Ir a tu proyecto**
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión
3. Selecciona tu proyecto `Motorepuestos-FL`

### **Paso 2: Configurar Variables**
1. Ve a **Settings** (⚙️)
2. Haz clic en **Environment Variables**
3. Haz clic en **"Add New"**

### **Paso 3: Agregar cada variable**
Para cada variable:
1. **Name**: Copia el nombre (ej: `VITE_SUPABASE_URL`)
2. **Value**: Copia el valor
3. **Environment**: Marca todas las opciones (Production, Preview, Development)
4. Haz clic en **"Save"**

### **Paso 4: Verificar**
1. Asegúrate de que tienes **6 variables** configuradas
2. Todas deben empezar con `VITE_` (NO `REACT_APP_`)
3. Todas deben estar marcadas para todos los entornos

### **Paso 5: Redeploy**
1. Ve a **Deployments**
2. Haz clic en **"Redeploy"** en el último deployment
3. O haz un push al repositorio para trigger automático

## ⚠️ Variables INCORRECTAS (Eliminar si existen)

Si ves estas variables, **ELIMÍNALAS**:
- ❌ `REACT_APP_SUPABASE_URL`
- ❌ `REACT_APP_SUPABASE_ANON_KEY`
- ❌ `REACT_APP_APP_NAME`
- ❌ `REACT_APP_APP_VERSION`

## ✅ Variables CORRECTAS (Agregar)

Estas son las que debes tener:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_SUPABASE_SERVICE_ROLE_KEY`
- ✅ `VITE_APP_NAME`
- ✅ `VITE_APP_VERSION`
- ✅ `VITE_APP_ENV`

## 🧪 Verificación

Después del redeploy:
1. Abre tu aplicación en Vercel
2. Abre la consola del navegador (F12)
3. Deberías ver: `✅ Supabase configurado correctamente`
4. Los productos deberían cargarse
5. El login debería funcionar

## 🆘 Si sigue sin funcionar

1. **Verificar CORS en Supabase**:
   - Ve a Supabase Dashboard → Settings → API
   - Agrega tu dominio de Vercel a CORS
   - Ejemplo: `https://tu-app.vercel.app`

2. **Verificar variables**:
   - Asegúrate de que no hay espacios extra
   - Verifica que las URLs están completas
   - Confirma que están marcadas para todos los entornos

---

## 🎯 Resumen Final

**Variables obligatorias para que funcione:**
1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY`
3. `VITE_SUPABASE_SERVICE_ROLE_KEY`

**Después de configurar:**
1. Redeploy en Vercel
2. Configurar CORS en Supabase
3. Probar login y carga de productos

**¡Con esto debería funcionar igual que en localhost! 🎉**
