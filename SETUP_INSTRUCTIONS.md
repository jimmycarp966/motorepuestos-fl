# 🚀 Instrucciones de Configuración - Motorepuestos F.L.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- Cuenta de Supabase creada
- Git configurado

## 🔧 Configuración del Proyecto

### 1. Clonar y Configurar

```bash
# Clonar el repositorio
git clone <repository-url>
cd motorepuestos-fl

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp env.example .env.local
```

### 2. Configurar Supabase

#### 2.1 Crear Proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Anotar URL y API Key

#### 2.2 Configurar Variables de Entorno
Editar `.env.local`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

#### 2.3 Configurar Base de Datos
Ejecutar en el SQL Editor de Supabase:

1. **Estructura de tablas** - `supabase-setup.sql`
2. **Políticas de seguridad** - `fix-rls-policies.sql`
3. **Funciones RPC** - `supabase-functions.sql`
4. **Datos de prueba** - `insert-sample-data.sql`

### 3. Configurar Autenticación

#### 3.1 Configurar Auth en Supabase
1. Ir a Authentication > Settings
2. Configurar URL de redirección: `http://localhost:3000`
3. Habilitar Email confirmations (opcional)

#### 3.2 Crear Usuario Administrador
```sql
-- Ejecutar en SQL Editor
INSERT INTO empleados (nombre, email, rol, activo)
VALUES ('Administrador', 'admin@motorepuestos.com', 'admin', true);
```

### 4. Verificar Configuración

#### 4.1 Probar Conexión
```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar en consola del navegador:
# ✅ Supabase configurado correctamente
# ✅ Conexión a Supabase: OK
```

#### 4.2 Probar Autenticación
1. Ir a `http://localhost:3000`
2. Intentar login con credenciales de prueba
3. Verificar que se crea la sesión

## 🏗️ Estructura de Base de Datos

### Tablas Principales

#### `empleados`
- Gestión de usuarios del sistema
- Roles: admin, cajero, vendedor, consulta
- Autenticación integrada con Supabase Auth

#### `productos`
- Catálogo de productos
- Control de stock automático
- Categorización y precios

#### `clientes`
- Base de datos de clientes
- Información de contacto
- Estado activo/inactivo

#### `ventas`
- Registro de ventas
- Relación con clientes y empleados
- Cálculo automático de totales

#### `venta_items`
- Items individuales de cada venta
- Relación con productos
- Precios y cantidades

#### `caja_movimientos`
- Control de ingresos y egresos
- Auditoría completa
- Cálculo automático de saldo

### Funciones RPC

#### `decrementar_stock(producto_id, cantidad)`
- Actualiza stock de productos
- Valida stock suficiente
- Previene stock negativo

#### `registrar_venta_completa(cliente_id, empleado_id, items)`
- Transacción completa de venta
- Validaciones automáticas
- Actualización de stock y caja

#### `obtener_estadisticas_dashboard()`
- KPIs para el dashboard
- Métricas en tiempo real
- Estadísticas del día

## 🔒 Seguridad

### Row Level Security (RLS)
- Todas las tablas tienen RLS habilitado
- Políticas por rol de usuario
- Acceso controlado por empleado

### Políticas de Acceso

#### Empleados
- **Admin**: Acceso completo
- **Cajero**: Gestión de caja y ventas
- **Vendedor**: Gestión de ventas y productos
- **Consulta**: Solo lectura

#### Tablas Protegidas
- `empleados`: Solo admin puede gestionar
- `caja_movimientos`: Solo cajero y admin
- `ventas`: Todos los roles autenticados
- `productos`: Vendedor, cajero y admin

## 🧪 Testing

### Pruebas Manuales

#### 1. Autenticación
```bash
# Probar login con diferentes roles
# Verificar redirección y permisos
# Probar logout
```

#### 2. Gestión de Productos
```bash
# Crear producto nuevo
# Editar producto existente
# Verificar control de stock
# Probar eliminación (soft delete)
```

#### 3. Ventas
```bash
# Crear venta con múltiples productos
# Verificar actualización de stock
# Comprobar registro en caja
# Validar cálculo de totales
```

#### 4. Caja
```bash
# Registrar ingreso
# Registrar egreso
# Verificar cálculo de saldo
# Probar validación de saldo insuficiente
```

#### 5. Dashboard
```bash
# Verificar KPIs en tiempo real
# Comprobar actualización tras ventas
# Validar gráficos y estadísticas
```

### Casos de Error

#### Conexión Perdida
```bash
# Desconectar internet
# Intentar operación
# Verificar mensaje de error
# Reconectar y verificar recuperación
```

#### Stock Insuficiente
```bash
# Intentar vender más stock del disponible
# Verificar mensaje de error
# Comprobar que no se registra la venta
```

#### Permisos Insuficientes
```bash
# Login con rol limitado
# Intentar acceder a módulo restringido
# Verificar redirección o bloqueo
```

## 🚀 Despliegue

### Vercel (Recomendado)

#### 1. Preparar para Despliegue
```bash
# Build de producción
npm run build

# Verificar que no hay errores
npm run preview
```

#### 2. Configurar Vercel
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Build command: `npm run build`
4. Output directory: `dist`

#### 3. Variables de Entorno en Producción
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_APP_NAME=Motorepuestos F.L.
VITE_DEBUG_MODE=false
```

### Netlify

#### Configuración Similar
1. Conectar repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurar variables de entorno

## 🔧 Mantenimiento

### Backups
- Supabase realiza backups automáticos
- Configurar backup manual si es necesario
- Exportar datos críticos periódicamente

### Monitoreo
- Revisar logs de Supabase
- Monitorear uso de recursos
- Verificar rendimiento de consultas

### Actualizaciones
- Mantener dependencias actualizadas
- Revisar cambios en Supabase
- Probar en entorno de desarrollo

## 🆘 Solución de Problemas

### Problemas Comunes

#### Error de Conexión
```bash
# Verificar variables de entorno
# Comprobar URL de Supabase
# Verificar API Key
# Revisar políticas de red
```

#### Error de Autenticación
```bash
# Verificar configuración de Auth
# Comprobar políticas RLS
# Revisar roles de usuario
# Verificar redirecciones
```

#### Error de Stock
```bash
# Verificar función decrementar_stock
# Comprobar transacciones
# Revisar validaciones
# Verificar concurrencia
```

### Logs y Debugging

#### Frontend
```bash
# Abrir DevTools
# Verificar consola
# Revisar Network tab
# Comprobar errores de JavaScript
```

#### Backend (Supabase)
```bash
# Ir a Dashboard > Logs
# Revisar errores de SQL
# Verificar funciones RPC
# Comprobar políticas RLS
```

## 📞 Soporte

### Recursos
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vite](https://vitejs.dev/guide/)
- [Documentación de React](https://react.dev/)

### Contacto
- Crear issue en GitHub
- Contactar equipo de desarrollo
- Revisar documentación del proyecto

---

**✅ Sistema configurado y listo para usar**
