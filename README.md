# 🏍️ Sistema de Gestión para Motorepuestos FL

Sistema completo de gestión empresarial adaptado específicamente para tiendas de motorepuestos, con interfaz moderna y funcionalidades avanzadas.

## ✨ Características Principales

### 🎯 **Gestión Completa del Negocio**
- **Dashboard Inteligente** - KPIs y métricas en tiempo real
- **Gestión de Productos** - Catálogo completo con categorías específicas de motorepuestos
- **Sistema de Ventas** - Registro de ventas con múltiples productos
- **Control de Caja** - Movimientos de ingresos y egresos
- **Gestión de Clientes** - Base de datos de clientes con historial
- **Gestión de Empleados** - Control de personal y roles
- **Reportes Avanzados** - Análisis y estadísticas del negocio

### 🎨 **Diseño Moderno**
- **Colores Azul Claro** - Paleta adaptada para motorepuestos
- **Degradados Elegantes** - Diseño visual atractivo
- **Interfaz Responsive** - Funciona en desktop, tablet y móvil
- **Animaciones Suaves** - Experiencia de usuario fluida

### 🔧 **Tecnologías Modernas**
- **React 18** - Framework de frontend
- **Supabase** - Backend como servicio (PostgreSQL + Auth)
- **Zustand** - Gestión de estado global
- **Tailwind CSS** - Framework de estilos
- **React Hook Form + Zod** - Validación de formularios
- **Recharts** - Gráficos y visualizaciones

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/motorepuestos-fl.git
cd motorepuestos-fl/client
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Supabase**
1. Crear proyecto en [Supabase](https://supabase.com)
2. Configurar las tablas de la base de datos
3. Copiar URL y API Key

### **4. Variables de Entorno**
Crear archivo `.env` en la carpeta `client`:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_APP_NAME=Motorepuestos F.L.
VITE_APP_VERSION=1.0.0
```

### **5. Ejecutar en Desarrollo**
```bash
npm start
```

## 📊 Módulos del Sistema

### **🏠 Dashboard**
- Resumen ejecutivo de ventas
- KPIs principales del negocio
- Gráficos de tendencias
- Alertas y notificaciones

### **📦 Productos**
- Catálogo de repuestos
- Categorías específicas (Motores, Frenos, Suspensión, etc.)
- Control de precios y stock
- Imágenes y descripciones
- Códigos de barras

### **🛒 Ventas**
- Interfaz de ventas intuitiva
- Múltiples productos por venta
- Selección de clientes
- Cálculo automático de totales
- Registro de transacciones

### **💰 Caja**
- Control de ingresos y egresos
- Saldo en tiempo real
- Arqueo de caja
- Historial de movimientos
- Reportes financieros

### **👥 Clientes**
- Base de datos de clientes
- Información de contacto
- Historial de compras
- Segmentación
- Gestión de cuentas

### **👨‍💼 Empleados**
- Control de personal
- Permisos granulares
- Roles específicos
- Actividades registradas

### **📈 Reportes**
- Reportes de ventas
- Análisis de rentabilidad
- Reportes de inventario
- KPIs del negocio
- Exportación de datos

## 🎨 Categorías de Productos

El sistema incluye categorías específicas para motorepuestos:

- **Motores** - Partes del motor
- **Frenos** - Sistema de frenado
- **Suspensión** - Componentes de suspensión
- **Eléctrico** - Sistema eléctrico
- **Combustible** - Sistema de combustible
- **Transmisión** - Transmisión y embrague
- **Carrocería** - Partes externas
- **Accesorios** - Accesorios varios
- **Lubricantes** - Aceites y lubricantes
- **Herramientas** - Herramientas especializadas
- **Neumáticos** - Llantas y neumáticos
- **Iluminación** - Sistema de luces
- **Audio** - Sistema de audio
- **Seguridad** - Elementos de seguridad
- **Otros** - Categoría general

## 🔐 Seguridad y Permisos

### **Niveles de Acceso**
- **Administrador** - Acceso completo al sistema
- **Gerente** - Gestión de ventas, inventario y reportes
- **Vendedor** - Operaciones de venta
- **Técnico** - Gestión de productos e inventario
- **Cajero** - Operaciones de caja
- **Auxiliar** - Operaciones básicas

### **Características de Seguridad**
- Autenticación obligatoria
- Validación de permisos por módulo
- Auditoría de acciones críticas
- Backup automático de datos

## 📱 Características Móviles

### **Optimizaciones Mobile**
- Interfaz táctil optimizada
- Botones de tamaño adecuado
- Navegación simplificada
- Carga rápida en conexiones lentas
- Modo offline básico

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
npm run build
# Conectar repositorio a Vercel
# Configurar variables de entorno
# Despliegue automático en cada push
```

### **Netlify**
```bash
npm run build
# Conectar repositorio a Netlify
# Configurar build settings
# Desplegar automáticamente
```

## 🔧 Configuración Avanzada

### **Personalización**
- Colores personalizables
- Logo de la empresa
- Configuración de impresoras
- Formatos de tickets

### **Integraciones**
- APIs de proveedores
- Sistemas de pago
- Servicios de delivery
- Herramientas de contabilidad

## 📈 Métricas y KPIs

### **Ventas**
- Ventas diarias/mensuales/anuales
- Productos más vendidos
- Horarios pico de ventas
- Tasa de conversión

### **Inventario**
- Rotación de stock
- Productos con bajo movimiento
- Valor del inventario
- Alertas de stock bajo

### **Clientes**
- Clientes nuevos vs recurrentes
- Valor promedio por cliente
- Frecuencia de compra
- Satisfacción del cliente

## 🐛 Solución de Problemas

### **Problemas Comunes**
1. **Error de conexión a Supabase**
   - Verificar configuración
   - Revisar variables de entorno
   - Comprobar credenciales

2. **Problemas de sincronización**
   - Verificar conexión a internet
   - Revisar logs de Supabase
   - Forzar recarga de datos

3. **Errores de permisos**
   - Verificar rol del usuario
   - Revisar configuración de permisos
   - Contactar administrador

## 🤝 Contribución

### **Cómo Contribuir**
1. Fork del repositorio
2. Crear rama para feature
3. Implementar cambios
4. Ejecutar tests
5. Crear Pull Request

### **Estándares de Código**
- ESLint configuration
- Prettier formatting
- Conventional commits
- Code review obligatorio

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

### **Canales de Soporte**
- **Email**: soporte@motorepuestos-fl.com
- **Documentación**: docs.motorepuestos-fl.com
- **Issues**: GitHub Issues

---

**🏍️ Desarrollado con ❤️ para motorepuestos de todo el mundo**
