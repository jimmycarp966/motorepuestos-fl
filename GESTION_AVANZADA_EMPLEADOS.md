# Gestión Avanzada de Empleados

## Resumen de Funcionalidades Implementadas

Se ha implementado un sistema completo de gestión de empleados con control granular de acceso, incluyendo:

### 🆕 Nuevas Funcionalidades

1. **Creación de Empleados con Autenticación**
   - Campos: nombre, email, contraseña, rol, salario, permisos de módulos
   - Creación automática en `auth.users` y `empleados`
   - Validación de contraseñas seguras

2. **Control Granular de Módulos**
   - Selección específica de módulos accesibles por empleado
   - Módulos disponibles: dashboard, empleados, productos, clientes, ventas, caja, calendario
   - Permisos basados en rol con posibilidad de personalización

3. **Edición Avanzada de Empleados**
   - Botón de editar en la tabla de empleados
   - Actualización de todos los campos incluyendo contraseña (opcional)
   - Modificación de permisos de módulos

4. **Visualización Mejorada**
   - Columna de salarios (mostrar/ocultar)
   - Visualización de permisos de módulos
   - Formato de moneda para salarios

## 📋 Campos Nuevos en la Base de Datos

### Tabla `empleados`
```sql
-- Campos agregados
password_hash TEXT,                    -- Hash de contraseña (compatibilidad)
salario DECIMAL(10,2) DEFAULT 0,      -- Salario mensual
permisos_modulos TEXT[] DEFAULT ARRAY['dashboard']::TEXT[]  -- Módulos accesibles
```

### Tipos TypeScript Actualizados
```typescript
interface Empleado {
  id: string
  nombre: string
  email: string
  password?: string // Solo para creación/actualización
  rol: 'Administrador' | 'Gerente' | 'Vendedor' | 'Técnico' | 'Almacén' | 'Cajero'
  salario: number
  permisos_modulos: string[]
  activo: boolean
  created_at: string
  updated_at: string
}
```

## 🔐 Sistema de Permisos

### Módulos Disponibles
- **dashboard**: Panel principal con estadísticas
- **empleados**: Gestión de personal (solo Administrador/Gerente)
- **productos**: Gestión de inventario
- **clientes**: Gestión de clientes
- **ventas**: Registro de ventas
- **caja**: Gestión de caja y arqueos
- **calendario**: Eventos y programación

### Permisos por Rol (Por Defecto)
```typescript
const rolePermissions = {
  'Administrador': ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'],
  'Gerente': ['dashboard', 'empleados', 'productos', 'clientes', 'ventas', 'caja', 'calendario'],
  'Vendedor': ['dashboard', 'ventas', 'clientes', 'calendario'],
  'Técnico': ['dashboard', 'productos', 'calendario'],
  'Almacén': ['dashboard', 'productos', 'calendario'],
  'Cajero': ['dashboard', 'ventas', 'caja', 'clientes', 'calendario'],
}
```

## 🛠️ Funciones del Store

### Nuevas Acciones en `empleadosSlice`
```typescript
// Crear empleado con autenticación completa
createEmpleadoWithAuth: (empleado: CreateEmpleadoData) => Promise<void>

// Actualizar empleado con autenticación
updateEmpleadoWithAuth: (id: string, empleado: UpdateEmpleadoData) => Promise<void>

// Obtener permisos disponibles para un rol
getEmpleadoPermissions: (rol: string) => string[]
```

### Flujo de Creación de Empleado
1. **Validación de datos** en el frontend
2. **Creación en auth.users** con Supabase Auth Admin
3. **Creación en tabla empleados** con permisos específicos
4. **Notificación de éxito/error**
5. **Actualización del estado local**

## 🎨 Componentes Actualizados

### EmpleadoForm
- **Campos nuevos**: contraseña, salario, permisos de módulos
- **Validación mejorada**: contraseñas seguras, salarios positivos
- **UI mejorada**: selección visual de módulos, toggle de contraseña
- **Funcionalidad**: creación y edición con autenticación

### EmpleadosTable
- **Columnas nuevas**: salario (toggle), permisos de módulos
- **Botón editar**: funcionalidad completa de edición
- **Visualización**: formato de moneda, badges de permisos
- **Filtros**: búsqueda mejorada

### Sidebar
- **Control de acceso**: basado en permisos específicos del usuario
- **Fallback**: sistema legacy para empleados sin permisos específicos
- **Navegación dinámica**: solo muestra módulos accesibles

## 📊 Base de Datos

### Script de Actualización
El archivo `update-empleados-schema.sql` contiene:
- Agregado de nuevos campos
- Actualización de empleados existentes
- Índices para rendimiento
- RLS policies actualizadas
- Funciones de validación
- Triggers para integridad de datos

### Ejecución del Script
```sql
-- Ejecutar en Supabase SQL Editor
-- El script es idempotente y seguro para ejecutar múltiples veces
```

## 🔄 Sincronización

### Con Supabase
- **Creación**: sincronización automática entre `auth.users` y `empleados`
- **Actualización**: cambios reflejados inmediatamente en la UI
- **Validación**: triggers en la base de datos para integridad

### Estado Local
- **Zustand**: actualización inmediata del estado
- **Notificaciones**: feedback visual para todas las operaciones
- **Carga**: indicadores de loading durante operaciones

## 🚀 Uso del Sistema

### Para Administradores
1. **Crear empleado**: Nuevo Empleado → completar formulario → seleccionar módulos
2. **Editar empleado**: Botón editar → modificar campos → guardar cambios
3. **Gestionar permisos**: seleccionar/deseleccionar módulos según necesidades

### Para Empleados
- **Acceso limitado**: solo ven módulos asignados en el sidebar
- **Funcionalidad completa**: acceso total a módulos permitidos
- **Navegación intuitiva**: interfaz adaptada a sus permisos

## 🔧 Configuración

### Variables de Entorno
No se requieren nuevas variables de entorno.

### Dependencias
Todas las dependencias existentes son suficientes.

### Compatibilidad
- **Backward compatible**: empleados existentes mantienen funcionalidad
- **Progressive enhancement**: nuevas funcionalidades se agregan sin romper lo existente
- **Fallback system**: sistema legacy para casos edge

## 📝 Notas de Implementación

### Seguridad
- **Contraseñas**: hasheadas automáticamente por Supabase Auth
- **Permisos**: validados tanto en frontend como backend
- **RLS**: políticas actualizadas para nuevos campos

### Rendimiento
- **Índices**: creados para consultas frecuentes
- **Caching**: estado local optimizado
- **Lazy loading**: componentes cargados según necesidad

### Mantenibilidad
- **Tipos TypeScript**: completamente tipados
- **Documentación**: código autodocumentado
- **Modularidad**: funciones separadas y reutilizables

## 🎯 Próximos Pasos

### Mejoras Sugeridas
1. **Auditoría de accesos**: registro de login/logout
2. **Permisos granulares**: permisos por acción (crear, editar, eliminar)
3. **Plantillas de roles**: configuraciones predefinidas
4. **Notificaciones push**: alertas de cambios importantes

### Optimizaciones
1. **Caching avanzado**: Redis para sesiones
2. **Búsqueda full-text**: búsqueda mejorada en empleados
3. **Exportación**: reportes de empleados en PDF/Excel

---

**Estado**: ✅ Implementado y funcional
**Versión**: 1.0.0
**Última actualización**: Diciembre 2024
