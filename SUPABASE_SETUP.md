# 🚀 Configuración de Supabase - Motorepuestos F.L.

## 📋 Credenciales del Proyecto

**URL del Proyecto:** `https://hsajhnxtlgfpkpzcrjyb.supabase.co`

**API Key (anon):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4`

**Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1NzY0NSwiZXhwIjoyMDcwODMzNjQ1fQ.Z_KzATN2NK9cvxAJMokNjtwhN1VWAUQH6Ezl_2-zFiU`

## 🔧 Pasos para Configurar Supabase

### 1. **Acceder al Proyecto**
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto: `hsajhnxtlgfpkpzcrjyb`

### 2. **Configurar Base de Datos**

#### A. Ejecutar Script de Funciones RPC (CORREGIDO)
1. Ve al **SQL Editor** en tu proyecto
2. **IMPORTANTE:** Usa el archivo `supabase-functions-fixed.sql` (no el original)
3. Copia y pega el contenido completo del archivo `supabase-functions-fixed.sql`
4. Haz clic en **"Run"** para ejecutar el script

**Nota:** El archivo original tenía un error en los parámetros por defecto. El archivo corregido soluciona el error `42P13: input parameters after one with a default value must also have defaults`.

#### B. Verificar que las funciones se crearon
1. Ve a **Database > Functions**
2. Deberías ver estas funciones:
   - `decrementar_stock`
   - `obtener_estadisticas_dashboard`
   - `obtener_ventas_por_periodo`
   - `obtener_productos_mas_vendidos`
   - `obtener_movimientos_caja_por_periodo`
   - `registrar_venta_completa`

### 3. **Configurar Autenticación**

#### A. Configurar URL de Redirección
1. Ve a **Authentication > Settings**
2. En **Site URL**, agrega: `http://localhost:3000`
3. En **Redirect URLs**, agrega: `http://localhost:3000`
4. Guarda los cambios

#### B. Crear Usuario de Prueba
1. Ve a **Authentication > Users**
2. Haz clic en **"Add user"**
3. Crea un usuario con:
   - **Email:** `admin@motorepuestos.com`
   - **Password:** `admin123`
   - **Email confirm:** ✅ (marcado)

### 4. **Verificar Configuración**

#### A. Probar Conexión
1. Ve a **Settings > API**
2. Verifica que las credenciales coinciden con las de arriba
3. Haz clic en **"Test connection"** para verificar

#### B. Verificar Tablas
1. Ve a **Table Editor**
2. Deberías ver las tablas principales:
   - `empleados`
   - `productos`
   - `clientes`
   - `ventas`
   - `venta_items`
   - `caja_movimientos`

## 🧪 Probar el Sistema

### 1. **Iniciar Servidor Local**
```bash
& "C:\Program Files\nodejs\npm.cmd" run dev
```

### 2. **Acceder a la Aplicación**
1. Ve a `http://localhost:3000`
2. Abre la consola del navegador (F12)
3. Verifica que no hay errores

### 3. **Probar Login**
1. Usa las credenciales:
   - **Email:** `admin@motorepuestos.com`
   - **Password:** `admin123`
2. Verifica que puedes acceder a todos los módulos

## 🔍 Verificación de Funcionamiento

### Indicadores de Éxito:
- ✅ No hay errores en la consola del navegador
- ✅ Puedes hacer login exitosamente
- ✅ Todos los módulos cargan correctamente
- ✅ Las funciones RPC responden sin errores
- ✅ Los datos se guardan y recuperan correctamente

### Posibles Errores y Soluciones:

#### Error: "Supabase not configured"
- Verificar que `.env.local` tiene las credenciales correctas
- Reiniciar el servidor de desarrollo

#### Error: "Functions not found"
- **IMPORTANTE:** Usar `supabase-functions-fixed.sql` en lugar del original
- Verificar que las funciones aparecen en Database > Functions

#### Error: "42P13: input parameters after one with a default value must also have defaults"
- **SOLUCIÓN:** Usar el archivo `supabase-functions-fixed.sql` que corrige este error
- Eliminar las funciones existentes y recrearlas con el archivo corregido

#### Error: "Authentication failed"
- Verificar que el usuario existe en Authentication > Users
- Verificar que la URL de redirección está configurada

#### Error: "Tables don't exist"
- Verificar que las tablas están creadas en Table Editor
- Ejecutar scripts de configuración de tablas si es necesario

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador para errores específicos
2. Verifica los logs en Supabase > Logs
3. Consulta la documentación en `SETUP_LOCAL.md`
4. **Para errores SQL:** Usa siempre `supabase-functions-fixed.sql`

---

**✅ Una vez completados estos pasos, tu sistema estará completamente funcional**
