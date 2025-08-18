# Implementación del Sistema de Cuenta Corriente

## Objetivo
Implementar un sistema completo de cuenta corriente que permita:
- Realizar ventas a crédito sin afectar la caja
- Gestionar pagos de deuda desde la tabla de clientes
- Validar límites de crédito
- Registrar automáticamente los pagos en caja

## Cambios Implementados

### 1. Base de Datos

#### Scripts SQL creados:
- `setup-cuenta-corriente-robusto.sql` - Configuración completa de la BD (maneja conflictos)
- `setup-cuenta-corriente-completo.sql` - Configuración alternativa
- `limpiar-datos-historicos.sql` - Limpieza de datos históricos
- `ejecutar-cambios-completos.sql` - Script de verificación

#### Modificaciones a tablas:
- **clientes**: Agregadas columnas `saldo_cuenta_corriente` y `limite_credito`
- **movimientos_caja**: Agregada columna `metodo_pago`

#### Funciones SQL creadas:
- `validar_limite_credito()` - Valida que no se exceda el límite
- `actualizar_saldo_cuenta_corriente()` - Actualiza saldos de forma segura

### 2. Store (Zustand)

#### VentasSlice modificado:
- **registrarVenta**: Ahora maneja ventas a cuenta corriente
  - Si `metodo_pago === 'cuenta_corriente'`: NO registra en caja, SÍ actualiza saldo del cliente
  - Si `metodo_pago !== 'cuenta_corriente'`: Registra normalmente en caja

#### ClientesSlice modificado:
- **actualizarCuentaCorriente**: Mejorada con validaciones
- **pagarDeudaCliente**: Nueva acción compuesta que:
  1. Valida el monto no exceda la deuda
  2. Actualiza saldo del cliente
  3. Registra ingreso en caja (modalidad cuenta corriente)
  4. Refresca datos relacionados
  5. Notifica el resultado

### 3. Componentes UI

#### Nuevos componentes:
- `PagarDeudaModal.tsx` - Modal para pagar deuda de cliente

#### Componentes modificados:
- `ClientesTable.tsx` - Agregada columna de cuenta corriente y botón de pago

### 4. Tipos TypeScript

#### Actualizaciones:
- `ClientesSlice`: Agregada acción `pagarDeudaCliente`
- `CreateVentaData`: Ya incluye `metodo_pago: 'cuenta_corriente'`

## Flujo de Datos

### Venta con Cuenta Corriente:
1. **UI**: Usuario selecciona modalidad "Cuenta Corriente"
2. **Store**: `registrarVenta` con `metodo_pago: 'cuenta_corriente'`
3. **Supabase**: 
   - Crea venta e items
   - Actualiza saldo del cliente (+total)
   - Descuenta stock
   - NO registra en caja
4. **UI**: Notifica éxito, refresca datos

### Pago de Deuda:
1. **UI**: Usuario hace clic en "Pagar Deuda" en tabla de clientes
2. **Store**: `pagarDeudaCliente(clienteId, monto)`
3. **Supabase**:
   - Actualiza saldo del cliente (-monto)
   - Registra ingreso en caja (modalidad cuenta corriente)
4. **UI**: Notifica éxito, refresca datos

## Invariantes de Negocio

### Cuenta Corriente:
- `saldo_cuenta_corriente` puede ser negativo (deuda) o positivo (crédito)
- `limite_credito > 0` habilita validaciones de límite
- `saldo_cuenta_corriente <= limite_credito` (si límite > 0)

### Ventas:
- Venta cuenta corriente requiere `cliente_id`
- Stock se descuenta independientemente del método de pago
- Solo ventas NO cuenta corriente afectan la caja

### Pagos:
- No se puede pagar más que la deuda pendiente
- Los pagos siempre se registran en caja (modalidad cuenta corriente)

## Instrucciones de Implementación

### Paso 1: Configurar Base de Datos
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: setup-cuenta-corriente-robusto.sql
```

### Paso 2: Limpiar Datos (Opcional)
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: limpiar-datos-historicos.sql
```

### Paso 3: Verificar Implementación
```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: ejecutar-cambios-completos.sql
```

### Paso 4: Probar Funcionalidad

#### Casos de Prueba:

1. **Venta Normal**:
   - Crear venta con método de pago diferente a cuenta corriente
   - Verificar que se registra en caja
   - Verificar que se descuenta stock

2. **Venta Cuenta Corriente**:
   - Crear venta con método de pago "cuenta corriente"
   - Verificar que NO se registra en caja
   - Verificar que se actualiza saldo del cliente
   - Verificar que se descuenta stock

3. **Pago de Deuda**:
   - Ir a tabla de clientes
   - Hacer clic en "Pagar Deuda" para cliente con saldo > 0
   - Ingresar monto válido
   - Verificar que se actualiza saldo del cliente
   - Verificar que se registra ingreso en caja

4. **Validaciones**:
   - Intentar pagar más que la deuda pendiente
   - Verificar que se muestra error apropiado

## Riesgos y Consideraciones

### Riesgos:
- **Integridad de datos**: Si falla la actualización del cliente, la venta queda inconsistente
- **Concurrencia**: Múltiples usuarios pagando simultáneamente pueden causar conflictos
- **Límites de crédito**: Clientes pueden exceder límites si no se valida correctamente

### Mitigaciones:
- **Transacciones**: Uso de transacciones SQL para atomicidad
- **Validaciones**: Validaciones en cliente y servidor
- **Notificaciones**: Sistema de notificaciones para errores
- **Logging**: Auditoría de todas las operaciones

## Mantenimiento

### Monitoreo:
- Revisar regularmente saldos de cuenta corriente
- Verificar integridad entre ventas y saldos de clientes
- Monitorear límites de crédito

### Backup:
- Hacer backup antes de ejecutar scripts de limpieza
- Verificar integridad de datos después de cambios

## Resumen Operativo

### Slices afectados:
- **ventasSlice**: Modificada acción `registrarVenta`
- **clientesSlice**: Agregada acción `pagarDeudaCliente`

### Invariantes de negocio:
- Saldo cliente = suma ventas crédito - suma pagos
- Stock se descuenta en todas las ventas
- Caja solo se afecta con ventas normales y pagos

### Flujos compuestos:
- **registrarVenta**: Venta + items + stock + (caja o saldo cliente)
- **pagarDeudaCliente**: Actualizar cliente + registrar caja

### Puntos de revalidación:
- Tabla de clientes (saldo actualizado)
- Movimientos de caja (nuevos pagos)
- Dashboard (KPIs actualizados)

### Plan de pruebas:
1. Venta normal → verificar caja
2. Venta cuenta corriente → verificar saldo cliente
3. Pago deuda → verificar ambos
4. Validaciones de límites y montos
