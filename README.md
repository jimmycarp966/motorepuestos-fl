# Motorepuestos F.L. - Sistema de Gestión

Sistema de gestión integral para empresa de motorepuestos, desarrollado con React 18+, TypeScript, Zustand y Supabase.

## 🎯 Objetivo del Sistema

Sistema de gestión completo que incluye:
- **Dashboard** con KPIs en tiempo real
- **Gestión de Productos** con control de stock
- **Ventas** con registro automático en caja
- **Gestión de Clientes** y Empleados
- **Control de Caja** con movimientos auditados
- **Reportes** exportables

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: Vite + React 18+ + TypeScript (strict mode)
- **Estado**: Zustand como Single Source of Truth (SSoT)
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Tablas**: TanStack Table

### Principios de Arquitectura
- **SSoT**: Todo dato crítico vive en el store Zustand
- **Acciones Compuestas**: Flujos de negocio atómicos (ej: venta → actualizar stock → registrar caja)
- **Selectores Finos**: Evita renders innecesarios
- **Encapsulación**: Supabase solo se accede desde acciones del store

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes modulares por dominio
│   ├── auth/           # Autenticación
│   ├── dashboard/      # Dashboard y KPIs
│   ├── productos/      # Gestión de productos
│   ├── ventas/         # Registro de ventas
│   ├── caja/           # Control de caja
│   ├── clientes/       # Gestión de clientes
│   ├── empleados/      # Gestión de empleados
│   ├── reportes/       # Reportes y análisis
│   ├── layout/         # Layout y navegación
│   └── ui/             # Componentes UI reutilizables
├── store/              # Estado global con Zustand
│   ├── index.ts        # Store principal y tipos
│   └── slices/         # Slices por dominio
├── lib/                # Utilidades y configuración
├── services/           # Servicios especializados
├── utils/              # Utilidades generales
└── hooks/              # Hooks personalizados
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd motorepuestos-fl

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
```

### Variables de Entorno
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuración de Supabase
1. Crear proyecto en Supabase
2. Ejecutar scripts SQL de configuración:
   - `supabase-setup.sql` - Estructura de tablas
   - `fix-rls-policies.sql` - Políticas de seguridad
   - `insert-sample-data.sql` - Datos de prueba

### Desarrollo
```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview
```

## 🔧 Funcionalidades Principales

### Dashboard
- KPIs en tiempo real (ventas del día, saldo de caja, stock crítico)
- Gráficos de ventas y distribución de productos
- Alertas de stock bajo

### Gestión de Productos
- CRUD completo de productos
- Control de stock automático
- Categorización y unidades de medida
- Alertas de stock bajo

### Ventas
- Registro de ventas con múltiples productos
- Cálculo automático de totales
- Actualización automática de stock
- Registro automático en caja

### Control de Caja
- Registro de ingresos y egresos
- Cálculo automático de saldo
- Auditoría completa de movimientos
- Validación de saldo para egresos

### Gestión de Clientes
- CRUD de clientes
- Historial de compras
- Estado activo/inactivo

### Gestión de Empleados
- Roles y permisos (admin, cajero, vendedor, consulta)
- Control de acceso por módulo
- Auditoría de acciones

## 🔒 Seguridad

### Autenticación
- Autenticación con Supabase Auth
- Roles y permisos por usuario
- Sesiones persistentes

### Base de Datos
- Row Level Security (RLS) habilitado
- Políticas de acceso por rol
- Validaciones server-side

### Frontend
- Validación de formularios con Zod
- Sanitización de datos
- Control de acceso por componente

## 📊 Flujos de Negocio

### Venta Completa (Acción Compuesta)
1. Validar stock disponible
2. Calcular totales
3. Crear venta en base de datos
4. Crear items de venta
5. Actualizar stock de productos
6. Registrar ingreso en caja
7. Actualizar KPIs del dashboard
8. Notificar resultado

### Invariantes de Negocio
- **Stock**: Nunca puede ser negativo
- **Caja**: Saldo = apertura + ingresos - egresos
- **Ventas**: Total = suma de items ± descuentos
- **Acceso**: Solo usuarios autenticados con rol apropiado

## 🧪 Testing

### Pruebas Manuales
1. **Autenticación**: Login/logout, roles y permisos
2. **Productos**: CRUD, stock, categorías
3. **Ventas**: Registro, cálculo de totales, actualización de stock
4. **Caja**: Ingresos, egresos, validación de saldo
5. **Dashboard**: KPIs, gráficos, alertas
6. **Reportes**: Exportación, filtros, cálculos

### Casos de Error
- Conexión perdida con Supabase
- Stock insuficiente para venta
- Saldo insuficiente para egreso
- Validaciones de formularios
- Permisos insuficientes

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Configuración de Vercel
- Variables de entorno configuradas
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

## 📈 Monitoreo y Logging

### Logging
- Cambios de estado registrados
- Acciones compuestas auditadas
- Errores centralizados

### Métricas
- KPIs en tiempo real
- Rendimiento de componentes
- Uso de recursos

## 🔄 Mantenimiento

### Actualizaciones
- Dependencias actualizadas regularmente
- Migraciones de base de datos versionadas
- Backups automáticos en Supabase

### Optimizaciones
- Lazy loading de componentes
- Code splitting por módulo
- Optimización de consultas

## 📝 Changelog

### v1.0.0 - Auditoría y Limpieza
- ✅ Eliminación de archivos duplicados (.js y .ts)
- ✅ Consolidación en TypeScript
- ✅ Optimización del store Zustand
- ✅ Implementación de acciones compuestas
- ✅ Mejora de la arquitectura modular
- ✅ Configuración estricta de TypeScript
- ✅ Optimización de componentes UI
- ✅ Sistema de notificaciones centralizado

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o consultas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar documentación de Supabase

---

**Desarrollado con ❤️ para Motorepuestos F.L.**
