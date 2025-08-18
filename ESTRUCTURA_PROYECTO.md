# 📁 Estructura Organizada del Proyecto

## 🎯 **Resumen de la Organización**

Se ha reorganizado completamente el proyecto para mejorar la mantenibilidad y encontrar archivos más fácilmente. Todos los archivos sueltos han sido movidos a carpetas específicas según su función.

---

## 📂 **Estructura de Carpetas**

### **🗄️ Database/**
Contiene todos los archivos relacionados con la base de datos:

- **`migrations/`** - Migraciones de productos y actualizaciones
  - `cargar-productos-*.sql` - Scripts para cargar productos
  - `actualizar-productos-*.sql` - Scripts para actualizar productos

- **`setup/`** - Configuración inicial de la base de datos
  - `supabase-setup.sql` - Configuración inicial de Supabase
  - `insert-sample-data.sql` - Datos de ejemplo

- **`fixes/`** - Correcciones y parches de la base de datos
  - `fix-*.sql` - Scripts de corrección

- **`verification/`** - Scripts de verificación
  - `verificar-*.sql` - Scripts para verificar estructura y datos

- **`audits/`** - Auditorías del sistema
  - `auditoria-*.sql` - Scripts de auditoría
  - `upgrade-auditoria-*.sql` - Actualizaciones de auditoría

- **`afip/`** - Configuración de facturación electrónica
  - `configurar-afip-produccion.sql` - Configuración AFIP para producción

- **`cuenta-corriente/`** - Gestión de cuenta corriente
  - `agregar-cuenta-corriente-*.sql` - Scripts de cuenta corriente
  - `agregar-metodo-pago-movimientos.sql` - Métodos de pago

- **`arqueos/`** - Gestión de arqueos de caja
  - `crear-tabla-arqueos.sql` - Tabla de arqueos
  - `historial-cajas-cerradas.sql` - Historial de cajas

- **`scripts/`** - Scripts generales de base de datos
  - `supabase-*.sql` - Scripts específicos de Supabase
  - `ejecutar-cambios-completos.sql` - Scripts de ejecución
  - `crear-tablas-faltantes.sql` - Creación de tablas
  - `limpiar-datos-historicos.sql` - Limpieza de datos
  - `solucion-error-funciones.sql` - Corrección de funciones

### **📚 Docs/**
Documentación del proyecto:

- **`afip/`** - Documentación de facturación electrónica
  - `CONFIGURACION_AFIP_PRODUCCION.md` - Guía de configuración AFIP
  - `IMPLEMENTACION_AFIP_COMPLETA.md` - Documentación completa AFIP

- **`deployment/`** - Documentación de despliegue
  - `VERCEL_*.md` - Configuración de Vercel
  - `COMPILACION_LOCAL.md` - Compilación local

- **`solutions/`** - Soluciones a problemas
  - `SOLUCION_*.md` - Soluciones implementadas
  - `DIAGNOSTICO_*.md` - Diagnósticos de problemas
  - `CORRECCION_LAYOUT_SIDEBAR.md` - Corrección de layout
  - `SISTEMA_RESTAURACION.md` - Restauración del sistema
  - `PUNTO_RESTAURACION_FUNCIONAL.md` - Puntos de restauración

- **`audits/`** - Auditorías y mejoras
  - `AUDITORIA_*.md` - Reportes de auditoría
  - `MEJORAS_*.md` - Mejoras implementadas
  - `MODERNIZACION_*.md` - Modernizaciones

- **`setup/`** - Configuración del sistema
  - `SETUP_INSTRUCTIONS.md` - Instrucciones de configuración
  - `IMPLEMENTACION_CUENTA_CORRIENTE.md` - Implementación cuenta corriente
  - `ROLES_Y_PERMISOS.md` - Roles y permisos
  - `GESTION_AVANZADA_EMPLEADOS.md` - Gestión de empleados

### **🎨 Assets/**
Recursos del proyecto:

- **`images/`** - Imágenes y logos
  - `LOGO*.png` - Logos del sistema

- **`data/`** - Datos del sistema
  - `produc.txt` - Archivo de productos

- **`certificates/`** - Certificados y documentación
  - `wsfev1-RG-4291.pdf` - Manual AFIP

---

## 📋 **Archivos en el Directorio Raíz**

Solo quedan los archivos esenciales del proyecto:

### **⚙️ Configuración del Proyecto**
- `package.json` - Dependencias del proyecto
- `package-lock.json` - Lock de dependencias
- `vite.config.ts` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind
- `tsconfig.json` - Configuración de TypeScript
- `eslint.config.js` - Configuración de ESLint
- `postcss.config.js` - Configuración de PostCSS

### **🚀 Despliegue**
- `vercel.json` - Configuración de Vercel
- `.vercelignore` - Archivos ignorados por Vercel
- `start-dev.bat` - Script de inicio desarrollo
- `serve-prod.bat` - Script de servidor producción
- `RESTAURACION_RAPIDA.bat` - Script de restauración

### **📄 Archivos Esenciales**
- `README.md` - Documentación principal
- `index.html` - Página principal
- `.gitignore` - Archivos ignorados por Git
- `env.example` - Ejemplo de variables de entorno

### **📁 Carpetas del Proyecto**
- `src/` - Código fuente
- `public/` - Archivos públicos
- `dist/` - Archivos de distribución
- `node_modules/` - Dependencias
- `.git/` - Control de versiones
- `.vercel/` - Configuración de Vercel

---

## 🎯 **Beneficios de la Nueva Estructura**

### **✅ Organización Clara**
- Cada tipo de archivo tiene su lugar específico
- Fácil navegación y búsqueda
- Separación clara de responsabilidades

### **✅ Mantenibilidad**
- Archivos relacionados están agrupados
- Fácil identificación de scripts de base de datos
- Documentación organizada por categorías

### **✅ Escalabilidad**
- Estructura preparada para crecimiento
- Fácil agregar nuevos archivos en las carpetas correctas
- Separación de configuraciones por ambiente

### **✅ Colaboración**
- Estructura clara para nuevos desarrolladores
- Documentación accesible y organizada
- Scripts de base de datos bien categorizados

---

## 🔍 **Cómo Encontrar Archivos**

### **Para Scripts de Base de Datos:**
- Migraciones: `database/migrations/`
- Configuración: `database/setup/`
- Correcciones: `database/fixes/`
- Verificaciones: `database/verification/`

### **Para Documentación:**
- AFIP: `docs/afip/`
- Despliegue: `docs/deployment/`
- Soluciones: `docs/solutions/`
- Auditorías: `docs/audits/`

### **Para Recursos:**
- Imágenes: `assets/images/`
- Datos: `assets/data/`
- Certificados: `assets/certificates/`

---

## 📝 **Notas Importantes**

1. **Todos los archivos SQL** están ahora organizados en `database/`
2. **Toda la documentación** está en `docs/` por categorías
3. **Recursos del proyecto** están en `assets/`
4. **Solo archivos esenciales** permanecen en el directorio raíz

**¡El proyecto ahora está completamente organizado y es mucho más fácil de navegar!** 🎉
