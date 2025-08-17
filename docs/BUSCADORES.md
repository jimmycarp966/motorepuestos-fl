# Buscadores Inteligentes - Motorepuestos FL

## Resumen

Se han implementado buscadores inteligentes en los módulos de **Productos** y **Ventas** que permiten búsqueda en tiempo real con filtrado local.

## Características

### 🔍 Búsqueda Inteligente
- **Búsqueda parcial**: No es necesario que el término comience con la palabra
- **Case-insensitive**: No distingue entre mayúsculas y minúsculas
- **Tiempo real**: Los resultados se filtran instantáneamente al escribir
- **Múltiples campos**: Busca en varios campos simultáneamente

### 🎨 Interfaz de Usuario
- **Icono de búsqueda**: Indica claramente que es un campo de búsqueda
- **Botón de limpiar**: Permite borrar rápidamente el término de búsqueda
- **Contador de resultados**: Muestra cuántos elementos se encontraron
- **Estados vacíos**: Mensajes informativos cuando no hay resultados

## Módulo de Productos

### Campos de Búsqueda
- **Nombre del producto**: Ej: "aceite", "filtro"
- **Código SKU**: Ej: "1728", "FOCO 110"
- **Descripción**: Texto descriptivo del producto
- **Categoría**: Ej: "Lubricantes", "Suspensión"
- **Unidad de medida**: Ej: "Litro", "Unidad"

### Ejemplos de Búsqueda
```
"aceite" → Encuentra todos los productos que contengan "aceite" en el nombre
"1728" → Encuentra el producto con SKU "1728"
"lubricantes" → Encuentra todos los productos de la categoría "Lubricantes"
"litro" → Encuentra todos los productos medidos en litros
```

## Módulo de Ventas

### Campos de Búsqueda
- **ID de venta**: Identificador único de la venta
- **Cliente**: Nombre del cliente asociado
- **Empleado**: Nombre del empleado que realizó la venta
- **Fecha**: Fecha de la venta
- **Total**: Monto total de la venta

### Ejemplos de Búsqueda
```
"2024" → Encuentra ventas del año 2024
"Juan" → Encuentra ventas de clientes o empleados llamados Juan
"1500" → Encuentra ventas con total de $1500
"1e6c324e" → Encuentra la venta con ID específico
```

## Implementación Técnica

### Hook Personalizado: `useSearchFilter`
```typescript
const filteredData = useSearchFilter({
  data: productos,
  searchTerm,
  searchFields: ['nombre', 'codigo_sku', 'categoria'],
  searchFunction: (item, term) => {
    // Lógica de búsqueda personalizada
  }
})
```

### Componente Reutilizable: `SearchInput`
```typescript
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Buscar productos..."
  focusColor="blue"
/>
```

## Ventajas de la Implementación

### ✅ Rendimiento
- **Filtrado local**: No requiere llamadas al servidor
- **Memoización**: Resultados cacheados con `useMemo`
- **Búsqueda instantánea**: Sin delays ni loading states

### ✅ Experiencia de Usuario
- **Responsive**: Funciona en todos los dispositivos
- **Accesible**: Navegación por teclado y lectores de pantalla
- **Intuitiva**: Interfaz familiar y fácil de usar

### ✅ Mantenibilidad
- **Código reutilizable**: Hook y componentes compartidos
- **Tipado fuerte**: TypeScript para prevenir errores
- **Fácil extensión**: Agregar nuevos campos de búsqueda es simple

## Uso en Otros Módulos

Para agregar buscadores a otros módulos:

1. **Importar el hook**:
```typescript
import { useSearchFilter } from '../../hooks/useSearchFilter'
```

2. **Definir campos de búsqueda**:
```typescript
const filteredData = useSearchFilter({
  data: miData,
  searchTerm,
  searchFields: ['campo1', 'campo2'],
  searchFunction: (item, term) => {
    // Lógica personalizada si es necesaria
  }
})
```

3. **Agregar el input de búsqueda**:
```typescript
<input
  type="text"
  placeholder="Buscar..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="..."
/>
```

## Próximas Mejoras

- [ ] **Búsqueda avanzada**: Filtros por rangos de fechas, precios, etc.
- [ ] **Historial de búsquedas**: Guardar términos de búsqueda frecuentes
- [ ] **Búsqueda en servidor**: Para grandes volúmenes de datos
- [ ] **Autocompletado**: Sugerencias mientras se escribe
- [ ] **Búsqueda por voz**: Integración con APIs de reconocimiento de voz
