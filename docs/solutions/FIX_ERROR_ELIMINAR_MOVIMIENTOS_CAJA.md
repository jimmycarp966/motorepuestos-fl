# Fix: Error al Eliminar Movimientos de Caja

## Problema

Al intentar eliminar una venta del módulo de cajas, aparece el siguiente error:

```
Error al eliminar movimiento: Could not find the 'updated_at' column of 'movimientos_caja' in the schema cache
```

## Causa del Problema

El error ocurre porque:

1. **La tabla `movimientos_caja` no tiene la columna `updated_at`** en la definición original
2. **El código de `eliminarMovimiento` intenta actualizar esta columna** que no existe
3. **Falta la columna `estado`** para implementar el sistema de "tachado" en lugar de eliminación física

## Análisis del Código

En `src/store/slices/cajaSlice.ts`, línea 417-477, la función `eliminarMovimiento` intenta:

```typescript
const { error } = await supabase
  .from('movimientos_caja')
  .update({
    estado: 'eliminada',
    updated_at: DateUtils.getCurrentLocalDateTime() // ❌ Esta columna no existe
  })
  .eq('id', movimientoId)
```

## Solución

### 1. Script de Reparación

Ejecutar el script `database/fixes/fix-movimientos-caja-completo.sql` que:

- ✅ Agrega la columna `estado` a `movimientos_caja`
- ✅ Agrega la columna `updated_at` a `movimientos_caja`
- ✅ Crea el trigger para actualizar `updated_at` automáticamente
- ✅ Crea índices para mejorar el rendimiento
- ✅ Actualiza registros existentes con valores por defecto

### 2. Archivos Batch Creados

- `fix-movimientos-caja.bat` - Ejecuta el script de reparación
- `verificar-movimientos-caja.bat` - Verifica si la reparación fue exitosa

### 3. Pasos para Resolver

1. **Ejecutar verificación:**
   ```bash
   verificar-movimientos-caja.bat
   ```

2. **Si hay problemas, ejecutar reparación:**
   ```bash
   fix-movimientos-caja.bat
   ```

3. **Verificar nuevamente:**
   ```bash
   verificar-movimientos-caja.bat
   ```

## Estructura Final de la Tabla

Después del fix, la tabla `movimientos_caja` tendrá:

```sql
CREATE TABLE movimientos_caja (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto DECIMAL(10,2) NOT NULL,
    concepto TEXT NOT NULL,
    empleado_id UUID REFERENCES empleados(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'activa',           -- ✅ NUEVA
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- ✅ NUEVA
);
```

## Funcionalidad Implementada

- **Eliminación lógica**: Los movimientos se marcan como `estado = 'eliminada'` en lugar de borrarse
- **Auditoría**: Se registra `updated_at` cuando se modifica un movimiento
- **Cálculos correctos**: El saldo excluye movimientos con `estado = 'eliminada'`
- **Triggers automáticos**: `updated_at` se actualiza automáticamente

## Verificación

El script de verificación comprueba:

- ✅ Existencia de columna `estado`
- ✅ Existencia de columna `updated_at`
- ✅ Existencia de trigger `update_movimientos_caja_updated_at`
- ✅ Existencia de función `update_updated_at_column`
- ✅ Índices de rendimiento
- ✅ Registros con valores correctos

## Notas Importantes

- Este fix es **no destructivo** - no elimina datos existentes
- Los movimientos existentes se marcan como `estado = 'activa'`
- El `updated_at` de registros existentes se establece igual a `created_at`
- Solo los administradores pueden eliminar movimientos (según el código actual)

## Archivos Relacionados

- `src/store/slices/cajaSlice.ts` - Lógica de eliminación
- `src/components/caja/CajaTable.tsx` - Interfaz de usuario
- `database/fixes/fix-movimientos-caja-completo.sql` - Script de reparación
- `database/verification/verificar-movimientos-caja.sql` - Script de verificación
