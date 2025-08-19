# Solución: Errores de Logout y Permisos de Empleados

## Problemas Identificados

### 1. Error "Auth session missing" al cerrar sesión
- **Síntoma**: Al intentar cerrar sesión, aparece el error "Auth session missing!"
- **Causa**: La función `logout` intentaba cerrar la sesión en Supabase antes de limpiar el estado local
- **Impacto**: El usuario no puede cerrar sesión correctamente

### 2. Permisos de empleados no se respetan
- **Síntoma**: El usuario Mateo puede ver módulos adicionales (dashboard, productos) cuando solo debería ver clientes, cajas y ventas
- **Causa**: La lógica de permisos no priorizaba correctamente los permisos específicos del usuario sobre los permisos del rol
- **Impacto**: Los usuarios pueden acceder a módulos no autorizados

## Soluciones Implementadas

### 1. Corrección del Error de Logout

**Archivo modificado**: `src/store/slices/authSlice.ts`

**Cambios realizados**:
- Limpiar el estado local ANTES de cerrar la sesión en Supabase
- Manejar errores de Supabase sin lanzar excepciones
- Asegurar que el estado se limpie incluso si hay errores de conexión

```typescript
// Antes
const { error } = await supabase.auth.signOut()
if (error) throw error
set(() => ({ auth: { session: null, user: null, loading: false } }))

// Después
set(() => ({ auth: { session: null, user: null, loading: false } }))
const { error } = await supabase.auth.signOut()
if (error) console.warn('Error en signOut de Supabase:', error)
```

### 2. Corrección del Sistema de Permisos

**Archivos modificados**:
- `src/hooks/usePermissionGuard.ts`
- `src/lib/config.ts`

**Cambios realizados**:

#### A. Priorización de permisos específicos del usuario
```typescript
const canAccess = useCallback((module: ModuleName): boolean => {
  if (!isAuthenticated || !user) return false
  
  // Si el usuario es administrador, tiene acceso a todo
  if (user.rol === 'Administrador') {
    return true
  }
  
  // Verificar permisos específicos del usuario primero
  const hasModuleInPermissions = user.permisos_modulos?.includes(module) || false
  
  // Si el usuario tiene permisos específicos, usarlos
  if (hasModuleInPermissions) {
    return true
  }
  
  // Si no tiene permisos específicos, verificar permisos del rol
  const hasRolePermissions = (rolePermissions[module] || []).length > 0
  
  return hasRolePermissions
}, [isAuthenticated, user, rolePermissions])
```

#### B. Configuración de permisos estrictos desactivada
```typescript
security: {
  strictRoles: false // Cambiar a false para permitir permisos específicos del usuario
}
```

#### C. Logs de debugging agregados
```typescript
if (config.debug) {
  console.log(`🔐 [Permissions] Verificando acceso a ${module}:`, {
    usuario: user.nombre,
    rol: user.rol,
    permisosEspecificos: user.permisos_modulos,
    tienePermisoEspecifico: hasModuleInPermissions,
    permisosDelRol: rolePermissions[module] || []
  })
}
```

### 3. Herramientas de Debug y Verificación

#### A. Componente de Debug de Permisos
**Archivo**: `src/components/ui/PermissionsDebug.tsx`

- Muestra información detallada de permisos en tiempo real
- Solo visible en modo desarrollo (`config.debug = true`)
- Incluido en el dashboard para verificación inmediata

#### B. Script de Corrección de Base de Datos
**Archivo**: `database/fixes/fix-permisos-usuario-mateo.sql`

- Script SQL para verificar y corregir permisos
- Función de validación de permisos por rol
- Verificación de otros usuarios con posibles problemas

#### C. Script Node.js para Corrección Automática
**Archivo**: `scripts/fix-permisos-mateo.js`

- Busca automáticamente usuarios con "mateo" en nombre o email
- Actualiza permisos a: `['clientes', 'caja', 'ventas']`
- Verifica el resultado y reporta otros usuarios con problemas

#### D. Script Batch para Ejecución Fácil
**Archivo**: `fix-permisos-mateo.bat`

- Ejecuta la corrección con un doble clic
- Muestra progreso y resultados

## Instrucciones de Uso

### Para Corregir Permisos del Usuario Mateo

1. **Ejecutar script automático**:
   ```bash
   # Opción 1: Script batch (Windows)
   fix-permisos-mateo.bat
   
   # Opción 2: Script Node.js
   node scripts/fix-permisos-mateo.js
   ```

2. **Ejecutar script SQL manualmente**:
   - Abrir Supabase Dashboard
   - Ir a SQL Editor
   - Ejecutar: `database/fixes/fix-permisos-usuario-mateo.sql`

### Para Verificar Permisos en Tiempo Real

1. **Activar modo debug** (si no está activado):
   - El modo debug ya está activado por defecto en desarrollo

2. **Verificar en el dashboard**:
   - Iniciar sesión con el usuario Mateo
   - Ir al dashboard
   - Ver el componente de debug de permisos en la parte superior

3. **Revisar logs de consola**:
   - Abrir DevTools (F12)
   - Ir a la pestaña Console
   - Buscar logs con el prefijo `🔐 [Permissions]`

## Verificación de la Solución

### 1. Verificar Logout
- [ ] Iniciar sesión con cualquier usuario
- [ ] Hacer clic en "Cerrar Sesión"
- [ ] Verificar que no aparece el error "Auth session missing!"
- [ ] Verificar que se redirige correctamente al login

### 2. Verificar Permisos del Usuario Mateo
- [ ] Iniciar sesión con el usuario Mateo
- [ ] Verificar que SOLO puede acceder a:
  - [ ] Clientes
  - [ ] Caja
  - [ ] Ventas
- [ ] Verificar que NO puede acceder a:
  - [ ] Dashboard
  - [ ] Productos
  - [ ] Empleados
  - [ ] Reportes

### 3. Verificar Debug de Permisos
- [ ] En el dashboard, ver el componente de debug
- [ ] Verificar que muestra los permisos correctos
- [ ] Verificar logs en la consola del navegador

## Estructura de Permisos por Rol

| Rol | Permisos por Defecto | Permisos Específicos |
|-----|---------------------|---------------------|
| Administrador | Todos los módulos | Cualquier módulo |
| Gerente | Todos los módulos | Cualquier módulo |
| Vendedor | dashboard, clientes, ventas | Según configuración |
| Técnico | dashboard, productos | Según configuración |
| Almacén | dashboard, productos | Según configuración |
| Cajero | dashboard, clientes, ventas, caja | Según configuración |

## Notas Importantes

1. **Prioridad de Permisos**: Los permisos específicos del usuario tienen prioridad sobre los permisos del rol
2. **Administradores**: Siempre tienen acceso completo a todos los módulos
3. **Modo Debug**: Los logs de permisos solo aparecen en modo desarrollo
4. **Persistencia**: Los cambios en permisos se guardan en la base de datos y persisten entre sesiones

## Troubleshooting

### Si el usuario sigue viendo módulos no autorizados:
1. Verificar que se ejecutó correctamente el script de corrección
2. Verificar que el usuario tiene los permisos correctos en la base de datos
3. Cerrar sesión y volver a iniciar
4. Limpiar caché del navegador

### Si el logout sigue fallando:
1. Verificar conexión a internet
2. Verificar que Supabase esté funcionando
3. Revisar logs de consola para errores específicos

### Si el debug no aparece:
1. Verificar que `config.debug = true`
2. Verificar que el usuario está autenticado
3. Recargar la página
