# Compilación y Ejecución Local

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm (incluido con Node.js)

## Configuración Inicial

1. **Clonar el repositorio** (si no lo has hecho ya)
2. **Instalar dependencias**:
   ```bash
   npm install
   ```

## Variables de Entorno

El archivo `.env` se crea automáticamente con los scripts, pero puedes crearlo manualmente:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hsajhnxtlgfpkpzcrjyb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4

# App Configuration
VITE_APP_NAME=Motorepuestos FL
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

## Scripts Disponibles

### Desarrollo Local

**Windows (PowerShell/CMD):**
```bash
.\start-dev.bat
```

**Linux/Mac:**
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### Compilación de Producción

**Windows (PowerShell/CMD):**
```bash
.\build-prod.bat
```

**Linux/Mac:**
```bash
npm run build
```

### Servir Aplicación Compilada

**Windows (PowerShell/CMD):**
```bash
.\serve-prod.bat
```

**Linux/Mac:**
```bash
npm install -g serve
serve -s dist -l 3000
```

## Solución de Problemas

### Error de Conexión con Supabase

Si ves el error "Error de Conexión", verifica:

1. **Variables de entorno**: Asegúrate de que el archivo `.env` existe y tiene las variables correctas
2. **Conexión a internet**: Verifica que tienes conexión a internet
3. **Supabase**: Verifica que el proyecto de Supabase esté activo

### Puerto 3000 Ocupado

Si el puerto 3000 está ocupado:

1. **Cambiar puerto en vite.config.ts**:
   ```typescript
   server: {
     port: 3001, // Cambiar a otro puerto
     open: true,
     host: true,
   },
   ```

2. **O usar otro puerto directamente**:
   ```bash
   npm run dev -- --port 3001
   ```

### Errores de Compilación

1. **Limpiar caché**:
   ```bash
   npm run build -- --force
   ```

2. **Reinstalar dependencias**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
├── store/              # Estado global (Zustand)
├── lib/                # Configuración y utilidades
├── utils/              # Utilidades y helpers
└── App.tsx             # Componente principal
```

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estado**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts

## Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación
npm run preview

# Ejecutar tests
npm run test

# Linting
npm run lint
```
