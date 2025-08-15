# Motorepuestos F.L. - Sistema de Gestión

Sistema completo de gestión para tienda de motorepuestos y lubricantes, desarrollado con React, TypeScript, Zustand y Supabase.

## 🚀 Características

- **Autenticación y Autorización**: Sistema de roles (admin, cajero, vendedor, consulta)
- **Gestión de Empleados**: CRUD completo con control de acceso por roles
- **Dashboard Interactivo**: KPIs y gráficos en tiempo real
- **Gestión de Productos**: Inventario con control de stock
- **Gestión de Clientes**: Base de datos de clientes
- **Sistema de Ventas**: Registro de ventas con descuento automático de inventario
- **Control de Caja**: Movimientos de ingresos y egresos
- **Notificaciones**: Sistema centralizado de notificaciones
- **UI Moderna**: Diseño responsive con Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estado**: Zustand (Single Source of Truth)
- **UI**: Tailwind CSS + shadcn/ui
- **Formularios**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL + Auth)
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd motorepuestos-fl
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda la URL y las claves API

#### 3.2 Configurar base de datos
1. Ve al SQL Editor en tu proyecto de Supabase
2. Ejecuta el contenido del archivo `supabase-setup.sql`
3. Esto creará todas las tablas, funciones y políticas necesarias

#### 3.3 Configurar autenticación
1. Ve a Authentication > Settings
2. Habilita Email auth
3. Configura las URLs de redirección según tu dominio

### 4. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 5. Ejecutar el proyecto
```bash
npm run dev
```

## 👥 Roles y Permisos

### Administrador
- Acceso completo a todos los módulos
- Gestión de empleados
- Configuración del sistema

### Cajero
- Dashboard
- Ventas
- Caja
- Clientes (solo lectura)

### Vendedor
- Dashboard
- Ventas
- Clientes

### Consulta
- Dashboard
- Productos (solo lectura)
- Clientes (solo lectura)

## 📊 Módulos del Sistema

### Dashboard
- KPIs en tiempo real
- Gráficos de ventas
- Productos con stock bajo
- Resumen de caja

### Empleados
- Lista de empleados
- Crear/editar/eliminar empleados
- Asignación de roles
- Control de estado activo/inactivo

### Productos
- Gestión de inventario
- Control de stock
- Categorización
- Precios y descripciones

### Clientes
- Base de datos de clientes
- Información de contacto
- Historial de compras

### Ventas
- Registro de ventas
- Selección de productos
- Cálculo automático de totales
- Descuento automático de inventario

### Caja
- Movimientos de ingresos/egresos
- Balance en tiempo real
- Historial de transacciones

## 🔐 Seguridad

- **Row Level Security (RLS)**: Políticas de acceso a nivel de fila
- **Autenticación**: Sistema de login seguro
- **Autorización**: Control de acceso basado en roles
- **Validación**: Validación de datos en cliente y servidor

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

### Netlify
1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Build command: `npm run build`

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Formateo de código
npm run format
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico:
- Email: soporte@motorepuestos.com
- Documentación: [docs.motorepuestos.com](https://docs.motorepuestos.com)

## 🔄 Actualizaciones

Para mantener el sistema actualizado:

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix
```

---

**Desarrollado con ❤️ para Motorepuestos F.L.**
