# 🚀 Configuración de Vercel para Motorepuestos FL

## 📋 Pasos para Configurar Vercel

### 1. Crear Cuenta en Vercel
- Ve a [vercel.com](https://vercel.com)
- Regístrate con tu cuenta de GitHub
- Conecta tu repositorio: `jimmycarp966/motorepuestos-fl`

### 2. Configuración del Proyecto
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Variables de Entorno (CRÍTICAS)

Configura estas variables en Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase (OBLIGATORIAS)
VITE_SUPABASE_URL=https://hsajhnxtlgfpkpzcrjyb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4

# App Configuration
VITE_APP_NAME=Motorepuestos F.L.
VITE_APP_VERSION=1.0.1

# Environment
NODE_ENV=production

# Development Configuration
VITE_DEBUG_MODE=false
VITE_API_TIMEOUT=30000
VITE_NOTIFICATION_DURATION=5000
VITE_MAX_NOTIFICATIONS=5
```

### 4. Configuración de Dominio Personalizado (Opcional)
- Ve a Settings → Domains
- Agrega tu dominio personalizado
- Configura DNS según las instrucciones

### 5. Configuración de Analytics (Opcional)
- Habilita Vercel Analytics en Settings → Analytics
- Agrega el script de tracking a tu aplicación

## 🔧 Configuración Avanzada

### Build Optimization
El archivo `vercel.json` ya está configurado con:
- Caché optimizado para assets estáticos
- SPA routing configurado
- Headers de seguridad
- Región de despliegue: US East (iad1)

### Environment Variables por Entorno
- **Production:** Configurar en Vercel Dashboard
- **Preview:** Usar las mismas variables de producción
- **Development:** Usar archivo `.env.local`

## 🚨 Troubleshooting

### Error: Build Failed
1. Verificar que todas las variables de entorno estén configuradas
2. Revisar logs de build en Vercel Dashboard
3. Probar build local: `npm run build`

### Error: Supabase Connection
1. Verificar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
2. Comprobar que Supabase esté activo
3. Verificar políticas RLS en Supabase

### Error: Routing
1. Verificar configuración en `vercel.json`
2. Asegurar que todas las rutas redirijan a `index.html`

## 📊 Monitoreo

### Vercel Dashboard
- **Analytics:** Métricas de rendimiento
- **Functions:** Logs de serverless functions
- **Deployments:** Historial de despliegues

### Integración con GitHub
- Despliegue automático en cada push a `main`
- Preview deployments en pull requests
- Rollback fácil a versiones anteriores

## 🔐 Seguridad

### Variables Sensibles
- Nunca committear `.env` files
- Usar Vercel Environment Variables
- Rotar claves de Supabase regularmente

### Headers de Seguridad
- CSP headers configurados
- HSTS habilitado
- X-Frame-Options configurado

## 📱 PWA Configuration

### Service Worker
- Configurado en `public/sw.js`
- Cache strategy optimizada
- Offline functionality

### Manifest
- Configurado en `public/manifest.json`
- Iconos y metadata PWA
- Install prompt configurado

## 🎯 Optimización de Rendimiento

### Build Optimization
- Code splitting automático
- Tree shaking habilitado
- Minificación de assets

### Caching Strategy
- Assets estáticos: 1 año
- HTML: No cache
- API responses: Configurable

## 📞 Soporte

### Recursos Útiles
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Configuration](https://vitejs.dev/config/)
- [Supabase Documentation](https://supabase.com/docs)

### Contacto
- Vercel Support: support@vercel.com
- GitHub Issues: [motorepuestos-fl](https://github.com/jimmycarp966/motorepuestos-fl/issues)
