# Migración de Productos - Motorepuestos FL

## Resumen

Este documento explica cómo migrar todos los productos del archivo `producto.txt` a la base de datos Supabase.

## Cambios Realizados

### 1. Base de Datos
- ✅ Agregada columna `stock_minimo` a la tabla `productos`
- ✅ Script SQL generado para migrar 1429 productos
- ✅ Mapeo de campos:
  - `Codigo` → `codigo_sku`
  - `Descripcion` → `nombre` y `descripcion`
  - `Precio Costo` → `costo`
  - `Precio Venta` → `precio_minorista`
  - `Precio Mayoreo` → `precio_mayorista`
  - `Inventario` → `stock`
  - `Inv. Minimo` → `stock_minimo`

### 2. Frontend
- ✅ Actualizados tipos TypeScript para incluir `stock_minimo`
- ✅ Agregada columna "Stock Mín." en la tabla de productos
- ✅ Agregado campo "Stock Mínimo" en el formulario de productos
- ✅ Validaciones actualizadas

## Pasos para Ejecutar la Migración

### Paso 1: Ejecutar Script SQL
1. Abrir el **SQL Editor** en Supabase
2. Copiar y pegar el contenido del archivo `migrate-productos-fixed.sql`
3. Ejecutar el script

**Nota:** Este script corregido elimina automáticamente la columna `precio` obsoleta antes de la migración.

### Paso 2: Verificar la Migración
El script incluye consultas de verificación que mostrarán:
- Total de productos migrados
- Stock total
- Precio promedio
- Stock mínimo total
- Ejemplos de productos migrados

### Paso 3: Probar la Aplicación
1. Recargar la aplicación
2. Verificar que se muestren todos los productos
3. Confirmar que la columna "Stock Mín." aparezca en la tabla
4. Probar crear/editar productos con el nuevo campo

## Estructura de Datos

### Tabla productos
```sql
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR NOT NULL,
  descripcion TEXT,
  codigo_sku VARCHAR NOT NULL UNIQUE,
  precio_minorista DECIMAL(10,2) NOT NULL,
  precio_mayorista DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR NOT NULL,
  unidad_medida VARCHAR NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Tipos TypeScript
```typescript
interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  codigo_sku: string
  precio_minorista: number
  precio_mayorista: number
  costo: number
  stock: number
  stock_minimo: number  // ← Nueva columna
  categoria: string
  unidad_medida: string
  activo: boolean
  created_at: string
  updated_at: string
}
```

## Estadísticas de la Migración

- **Total de productos**: 1429
- **Categorías detectadas automáticamente**:
  - Lubricantes
  - Repuestos
  - Motor
  - Suspensión
  - Eléctrico
  - Iluminación
  - Filtros
  - Carburación
  - Espejos
  - Accesorios
  - Refrigeración
  - Limpieza
  - Seguridad
  - Herramientas
  - Neumáticos

- **Unidades de medida**:
  - Unidad
  - Litro
  - Juego
  - Par

## Notas Importantes

1. **Backup**: Se recomienda hacer backup de la tabla antes de ejecutar el TRUNCATE
2. **Precios**: Los precios mayoristas están en 0.00 en el archivo original
3. **Categorías**: Se asignaron automáticamente basándose en el nombre del producto
4. **Stock mínimo**: Se migró desde el campo "Inv. Minimo" del archivo

## Solución de Problemas

### Error: "column stock_minimo does not exist"
- Ejecutar primero: `ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;`

### Error: "null value in column precio violates not-null constraint"
- **SOLUCIONADO:** El script `migrate-productos-fixed.sql` elimina automáticamente la columna `precio` obsoleta
- Si persiste el error, ejecutar manualmente: `ALTER TABLE productos DROP COLUMN IF EXISTS precio;`

### Error: "duplicate key value violates unique constraint"
- El script incluye TRUNCATE que elimina todos los productos existentes
- Verificar que no haya conflictos de SKU

### Error: "syntax error"
- Verificar que el archivo SQL se copió completamente
- Asegurarse de que no haya caracteres especiales corruptos

## Archivos Modificados

- `migrate-productos-fixed.sql` - Script de migración corregido
- `src/store/types.ts` - Tipos TypeScript
- `src/lib/supabase.ts` - Tipos de Supabase
- `src/components/productos/ProductosTable.tsx` - Tabla de productos
- `src/components/productos/ProductoForm.tsx` - Formulario de productos
- `scripts/generate-migration.js` - Script generador de migración

## Verificación Final

Después de la migración, verificar:

1. ✅ Todos los productos aparecen en la tabla
2. ✅ La columna "Stock Mín." muestra valores correctos
3. ✅ El formulario permite editar stock mínimo
4. ✅ Los cálculos de margen funcionan correctamente
5. ✅ No hay errores en la consola del navegador
