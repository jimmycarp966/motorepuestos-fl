# Mejoras en Reporte de Caja - Vista Diaria

## Descripción

Se ha implementado una nueva funcionalidad en el módulo de reportes que permite ver la caja diaria con todos los movimientos detallados y exportar esta información a PDF.

## Funcionalidades Agregadas

### 1. Botón "Ver Caja" en Reporte de Caja

- **Ubicación**: En la tabla de reporte de caja, se agregó una nueva columna "Acciones"
- **Funcionalidad**: Cada fila del reporte de caja ahora tiene un botón "Ver Caja" que abre un modal con los detalles completos de esa fecha

### 2. Modal de Caja Diaria

El modal muestra:

#### Estadísticas del Día
- **Total Ingresos**: Suma de todos los ingresos del día
- **Total Egresos**: Suma de todos los egresos del día  
- **Saldo Final**: Diferencia entre ingresos y egresos
- **Cantidad de Movimientos**: Número total de operaciones

#### Tabla de Ingresos
- Hora del movimiento
- Concepto/descripción
- Empleado responsable
- Método de pago
- Monto

#### Tabla de Egresos
- Hora del movimiento
- Concepto/descripción
- Empleado responsable
- Método de pago
- Monto

### 3. Exportación a PDF

- **Botón**: "Exportar PDF" en la parte superior del modal
- **Contenido del PDF**:
  - Título: "Reporte de Caja Diaria"
  - Fecha del reporte
  - Resumen del día con estadísticas
  - Tabla de ingresos (si existen)
  - Tabla de egresos (si existen)
- **Nombre del archivo**: `caja-diaria-YYYY-MM-DD.pdf`

## Archivos Modificados

### Nuevos Archivos
- `src/components/caja/CajaDiariaModal.tsx` - Modal principal de caja diaria

### Archivos Modificados
- `src/components/reportes/ReportesTable.tsx` - Agregado botón y modal
- `src/components/index.ts` - Exportación del nuevo componente
- `src/store/types.ts` - Agregada propiedad `estado` a `MovimientoCaja`
- `src/lib/dateUtils.ts` - Agregado método `formatDateTime`

### Dependencias Agregadas
- `jspdf` - Para generar PDFs
- `jspdf-autotable` - Para crear tablas en PDFs

## Uso

1. **Acceder al reporte**: Ir a Reportes → Caja
2. **Generar reporte**: Configurar filtros y generar reporte de caja
3. **Ver caja diaria**: Hacer clic en "Ver Caja" en cualquier fila
4. **Exportar PDF**: Hacer clic en "Exportar PDF" en el modal

## Características Técnicas

### Filtrado de Movimientos
- Solo se muestran movimientos con estado `activa` (excluye eliminados)
- Filtrado por fecha exacta del reporte
- Separación automática entre ingresos y egresos

### Diseño Responsivo
- Modal adaptable a diferentes tamaños de pantalla
- Tablas con scroll horizontal en dispositivos móviles
- Colores diferenciados para ingresos (verde) y egresos (rojo)

### Generación de PDF
- Formato profesional con tablas estructuradas
- Colores diferenciados para ingresos y egresos
- Información completa de cada movimiento
- Nombre de archivo descriptivo con fecha

## Beneficios

1. **Visibilidad completa**: Ver todos los movimientos de un día específico
2. **Análisis detallado**: Desglose de ingresos vs egresos
3. **Documentación**: Exportar reportes para archivo o auditoría
4. **Trazabilidad**: Identificar empleados responsables de cada operación
5. **Eficiencia**: Acceso rápido desde el reporte general de caja

## Consideraciones

- Los movimientos eliminados no aparecen en el reporte
- El PDF incluye toda la información visible en el modal
- La funcionalidad está integrada con el sistema de permisos existente
- Compatible con todos los métodos de pago del sistema
