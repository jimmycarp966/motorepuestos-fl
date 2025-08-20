# Implementación del Módulo de Facturación AFIP

## Descripción

Se ha implementado un nuevo módulo de facturación que permite generar facturas electrónicas para ARCA (Administración de Recursos de la Caja de Ahorro) integrado con AFIP. Este módulo es similar al de ventas pero específicamente diseñado para facturación electrónica.

## Funcionalidades Implementadas

### 1. Módulo de Facturación en Sidebar

- **Ubicación**: Nuevo ítem "Facturación" en el sidebar con ícono de factura
- **Acceso**: F3 (atajo de teclado)
- **Color**: Rosa (#E91E63) para diferenciarlo de ventas

### 2. Interfaz de Facturación

#### Configuración de Facturación
- **Tipo de Comprobante**: 
  - Factura A (Responsable Inscripto)
  - Factura B (Consumidor Final) 
  - Factura C (Exento)
- **Método de Pago**: Efectivo, Tarjeta, Transferencia, Cuenta Corriente
- **Selección de Cliente**: Búsqueda y selección de clientes

#### Búsqueda de Productos
- Búsqueda por nombre o código SKU
- Sugerencias automáticas con precios
- Precios automáticos según tipo de comprobante (A = mayorista, B/C = minorista)

#### Carrito de Facturación
- Agregar/eliminar productos
- Modificar cantidades
- Cambiar precios y tipos de precio
- Cálculo automático de totales
- Limpiar carrito

### 3. Atajos de Teclado

- **F10**: Enfocar buscador de productos
- **F11**: Finalizar facturación
- **F12**: Limpiar carrito

## Estructura de Datos

### Nuevos Tipos

```typescript
interface FacturaItem {
  id: string
  factura_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  tipo_precio: 'minorista' | 'mayorista'
  producto?: Producto
}

interface Factura {
  id: string
  cliente_id: string | null
  empleado_id: string
  total: number
  fecha: string
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'
  tipo_precio: 'minorista' | 'mayorista'
  tipo_comprobante: 'A' | 'B' | 'C'
  punto_venta: number
  numero_comprobante: number
  cae: string | null
  cae_vto: string | null
  estado_afip: 'pendiente' | 'aprobado' | 'rechazado' | 'error'
  created_at: string
  cliente?: Cliente
  empleado?: Empleado
  items?: FacturaItem[]
}
```

### Estado de Facturación

```typescript
interface FacturacionState {
  facturas: Factura[]
  loading: boolean
  error: string | null
}
```

## Archivos Creados/Modificados

### Nuevos Archivos
- `src/components/facturacion/FacturacionTable.tsx` - Componente principal de facturación
- `src/store/slices/facturacionSlice.ts` - Slice de estado para facturación

### Archivos Modificados
- `src/store/types.ts` - Agregados tipos para facturación
- `src/store/index.ts` - Agregado slice de facturación
- `src/components/index.ts` - Exportación del componente
- `src/components/layout/Sidebar.tsx` - Agregado ítem de facturación
- `src/App.tsx` - Agregado routing y carga de datos

## Funcionalidades Técnicas

### Slice de Facturación
- `fetchFacturas()` - Cargar facturas con paginación
- `registrarFactura()` - Crear nueva factura
- `updateFactura()` - Actualizar factura existente

### Validaciones
- Verificación de stock disponible
- Validación de cliente seleccionado
- Validación de productos en carrito
- Cálculo automático de totales

### Integración con Sistema Existente
- Uso de productos y clientes existentes
- Actualización automática de stock
- Logs de auditoría
- Sistema de notificaciones
- Manejo de errores

## Preparación para AFIP

### Campos Preparados
- `tipo_comprobante`: A, B, C según tipo de factura
- `punto_venta`: Punto de venta (configurable)
- `numero_comprobante`: Número secuencial
- `cae`: Código de Autorización Electrónico (pendiente)
- `cae_vto`: Fecha de vencimiento del CAE (pendiente)
- `estado_afip`: Estado de la factura en AFIP

### TODO: Integración AFIP
El sistema está preparado para integrar con AFIP. Se necesitará:

1. **Configuración AFIP**:
   - CUIT del contribuyente
   - Certificado digital
   - Clave privada
   - Punto de venta

2. **Servicios AFIP**:
   - Obtener próximo número de comprobante
   - Solicitar CAE
   - Generar XML de factura
   - Enviar a AFIP

3. **Generación de PDF**:
   - Template de factura
   - Inclusión de código QR
   - Datos del CAE

## Uso del Sistema

### Flujo de Facturación
1. **Seleccionar tipo de comprobante** (A, B, C)
2. **Elegir método de pago**
3. **Seleccionar cliente** (búsqueda automática)
4. **Agregar productos** al carrito
5. **Revisar y ajustar** cantidades y precios
6. **Finalizar facturación**

### Validaciones en Tiempo Real
- Stock disponible
- Cliente obligatorio
- Productos en carrito
- Precios válidos

## Beneficios

1. **Separación de Ventas y Facturación**: Permite manejar ventas internas y facturación AFIP por separado
2. **Preparado para AFIP**: Estructura lista para integración completa
3. **Interfaz Familiar**: Similar a ventas para facilitar adopción
4. **Validaciones Robustas**: Previene errores en facturación
5. **Auditoría Completa**: Logs de todas las operaciones
6. **Responsive**: Funciona en dispositivos móviles

## Consideraciones

- Los movimientos de facturación se registran en la tabla `facturas` separada de `ventas`
- El stock se actualiza automáticamente al crear facturas
- Los precios se ajustan automáticamente según el tipo de comprobante
- El sistema está preparado para manejar diferentes tipos de IVA según el comprobante
- La integración con AFIP se implementará en una fase posterior

## Próximos Pasos

1. **Configurar credenciales AFIP**
2. **Implementar servicios de AFIP**
3. **Generar templates de PDF**
4. **Configurar puntos de venta**
5. **Implementar validaciones específicas de AFIP**
6. **Agregar reportes de facturación**
