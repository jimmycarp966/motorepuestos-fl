# 🚀 Configuración Local - Motorepuestos F.L.

## 📋 Pasos para Desarrollo Local

### 1. **Configurar Supabase (Obligatorio)**

#### A. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Anota la **URL** y **API Key** (anon/public)

#### B. Configurar Base de Datos
1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Ejecuta los scripts en este orden:

**Paso 1: Estructura de tablas**
```sql
-- Copia y pega el contenido de supabase-setup.sql
-- Este script crea todas las tablas necesarias
```

**Paso 2: Funciones RPC**
```sql
-- Copia y pega el contenido de supabase-functions.sql
-- Este script crea las funciones necesarias para el sistema
```

**Paso 3: Datos de prueba (opcional)**
```sql
-- Puedes insertar datos de prueba para probar el sistema
INSERT INTO empleados (nombre, email, rol, activo) 
VALUES ('Admin', 'admin@test.com', 'admin', true);

INSERT INTO productos (nombre, descripcion, precio, stock, categoria, unidad_medida, activo)
VALUES 
  ('Aceite de Motor 4T', 'Aceite sintético para motos', 15.99, 50, 'Lubricantes', 'L', true),
  ('Freno de Disco', 'Freno delantero para moto', 45.99, 20, 'Frenos', 'pcs', true),
  ('Bujía NGK', 'Bujía de encendido', 8.99, 100, 'Eléctrico', 'pcs', true);
```

### 2. **Configurar Variables de Entorno**

#### A. Crear archivo .env.local
En la raíz del proyecto, crea el archivo `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# App Configuration
VITE_APP_NAME=Motorepuestos F.L.
VITE_APP_VERSION=1.0.0

# Development
VITE_DEBUG_MODE=true
VITE_API_TIMEOUT=30000

# Notifications
VITE_NOTIFICATION_DURATION=5000
VITE_MAX_NOTIFICATIONS=5
```

#### B. Obtener credenciales de Supabase
1. Ve a tu proyecto de Supabase
2. Ve a **Settings > API**
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 3. **Instalar Dependencias**

```bash
# Instalar todas las dependencias
npm install

# Si hay problemas, intenta:
npm install --legacy-peer-deps
```

### 4. **Verificar Configuración**

#### A. Probar conexión
```bash
# Iniciar servidor de desarrollo
npm run dev
```

#### B. Verificar en consola del navegador
Abre `http://localhost:3000` y verifica en la consola (F12):
```
✅ Supabase configurado correctamente
✅ Conexión a Supabase: OK
```

### 5. **Probar Sistema**

#### A. Crear usuario de prueba
1. Ve a **Authentication > Users** en Supabase
2. Crea un usuario manualmente o usa el existente
3. O ejecuta en SQL Editor:
```sql
INSERT INTO empleados (nombre, email, rol, activo) 
VALUES ('Test User', 'test@motorepuestos.com', 'admin', true);
```

#### B. Probar login
1. Ve a `http://localhost:3000`
2. Intenta hacer login con las credenciales
3. Verifica que puedes acceder a los módulos

## 🔍 Verificación Rápida

### Comandos para verificar:

```bash
# 1. Verificar que el archivo .env.local existe
ls -la .env.local

# 2. Verificar que las dependencias están instaladas
npm list --depth=0

# 3. Iniciar servidor
npm run dev

# 4. Verificar en navegador
# Abrir http://localhost:3000
# Revisar consola del navegador (F12)
```

### Indicadores de éxito:
- ✅ Servidor inicia sin errores
- ✅ Página carga correctamente
- ✅ No hay errores en consola del navegador
- ✅ Puedes hacer login
- ✅ Los módulos cargan correctamente

## 🆘 Solución de Problemas Comunes

### Error: "Supabase not configured"
```bash
# Verificar que .env.local existe y tiene las variables correctas
cat .env.local
```

### Error: "Cannot connect to Supabase"
```bash
# Verificar URL y API Key
# Verificar que el proyecto de Supabase está activo
```

### Error: "Tables don't exist"
```bash
# Ejecutar supabase-setup.sql en SQL Editor
# Verificar que las tablas se crearon correctamente
```

### Error: "Functions not found"
```bash
# Ejecutar supabase-functions.sql en SQL Editor
# Verificar que las funciones RPC se crearon
```

## 📝 Notas Importantes

### Para Desarrollo Local:
- ✅ **Supabase es obligatorio** - No hay modo offline
- ✅ **Variables de entorno son necesarias** - El sistema las requiere
- ✅ **Base de datos debe estar configurada** - Sin tablas no funciona
- ✅ **Funciones RPC son necesarias** - Para acciones compuestas

### Diferencias con Producción:
- 🔄 **URL de redirección**: `http://localhost:3000` (local) vs `https://tu-dominio.com` (prod)
- 🔄 **Debug mode**: `true` (local) vs `false` (prod)
- 🔄 **API timeout**: Más largo en local para debugging

## 🎯 Próximos Pasos

1. **Configurar Supabase** siguiendo los pasos arriba
2. **Crear .env.local** con tus credenciales
3. **Instalar dependencias** con `npm install`
4. **Iniciar servidor** con `npm run dev`
5. **Probar sistema** en `http://localhost:3000`
6. **Verificar todos los módulos** funcionan correctamente

---

**✅ Una vez configurado localmente, podrás probar todo el sistema antes de subir a Vercel**
