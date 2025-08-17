# Solución para el problema de pantalla en blanco en Productos

## Problema identificado

El módulo de productos muestra una pantalla en blanco debido a que:

1. **Discrepancia en tipos**: Los tipos definidos en el store no coinciden con la estructura de la tabla en Supabase
2. **Tabla inexistente o sin datos**: La tabla `productos` puede no existir o estar vacía
3. **Políticas RLS**: Las políticas de Row Level Security pueden estar bloqueando el acceso
4. **Manejo de errores**: El componente no maneja correctamente los estados de error

## Soluciones implementadas

### 1. Corrección de tipos en Supabase
Se actualizó `src/lib/supabase.ts` para que los tipos coincidan con la estructura real de la tabla:

```typescript
productos: {
  Row: {
    id: string
    nombre: string
    descripcion: string | null
    codigo_sku: string
    precio_minorista: number
    precio_mayorista: number
    stock: number
    categoria: string
    unidad_medida: string
    activo: boolean
    created_at: string
    updated_at: string
  }
}
```

### 2. Mejora del manejo de estados en ProductosTable
- Se agregó manejo de errores con estado visual
- Se mejoró el estado de loading
- Se agregó un useEffect para cargar productos al montar el componente

### 3. Mejora del logging en productosSlice
- Se agregó logging detallado para diagnosticar problemas
- Se mejoró el manejo de errores con mensajes más descriptivos

## Pasos para solucionar

### Paso 1: Ejecutar el script SQL
**Opción A (Script básico):**
1. Ir al dashboard de Supabase
2. Abrir el SQL Editor
3. Ejecutar el contenido del archivo `database-setup.sql`

**Opción B (Script robusto - recomendado):**
1. Ir al dashboard de Supabase
2. Abrir el SQL Editor
3. Ejecutar el contenido del archivo `database-setup-robust.sql`
4. Este script incluye verificaciones y manejo de errores mejorado

### Paso 2: Verificar la configuración
1. Asegurarse de que las variables de entorno estén configuradas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Paso 3: Probar la aplicación
1. Reiniciar el servidor de desarrollo: `npm run dev`
2. Iniciar sesión en la aplicación
3. Navegar al módulo de productos
4. Verificar que se muestren los productos de prueba

## Verificación

Si todo está configurado correctamente, deberías ver:

1. **Estado de loading**: Un spinner mientras se cargan los productos
2. **Tabla con datos**: Los 3 productos de prueba (Aceite, Filtro, Bujía)
3. **Funcionalidad completa**: Botón "Nuevo Producto" funcional

## Logs esperados en consola

```
✅ Supabase configurado correctamente
🔍 [productosSlice] Iniciando fetchProductos...
🔍 [productosSlice] Ejecutando consulta a Supabase...
✅ [productosSlice] Productos obtenidos: 3
✅ [productosSlice] Estado actualizado correctamente
🔍 [ProductosTable] Renderizando tabla con productos: 3
```

## Si el problema persiste

1. **Verificar autenticación**: Asegurarse de que el usuario esté autenticado
2. **Revisar políticas RLS**: Verificar que las políticas permitan acceso al usuario autenticado
3. **Verificar estructura de tabla**: Confirmar que la tabla tenga la estructura correcta
4. **Revisar logs de consola**: Buscar errores específicos en la consola del navegador

## Errores comunes y soluciones

### Error de sintaxis SQL
- **Error**: `syntax error at or near "NOT"` en políticas RLS
- **Solución**: El script corregido usa `DROP POLICY IF EXISTS` antes de crear las políticas

### Error de acceso denegado
- **Error**: `new row violates row-level security policy`
- **Solución**: Verificar que el usuario esté autenticado y las políticas RLS estén configuradas

### Tabla no encontrada
- **Error**: `relation "productos" does not exist`
- **Solución**: Ejecutar el script SQL completo para crear la tabla

## Archivos modificados

- `src/lib/supabase.ts` - Actualización de tipos
- `src/components/productos/ProductosTable.tsx` - Mejora del manejo de estados
- `src/store/slices/productosSlice.ts` - Mejora del logging y manejo de errores
- `database-setup.sql` - Script para configurar la base de datos
