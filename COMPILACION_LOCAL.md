# Compilación Local - Motorepuestos FL

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn instalado
- Git configurado

## Configuración Inicial

1. **Clonar el repositorio** (si no lo has hecho):
   ```bash
   git clone <url-del-repositorio>
   cd Motorepuestos-FL
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   - El archivo `.env` ya está configurado con las credenciales de Supabase
   - Las variables usan el prefijo `VITE_` para compatibilidad con Vite

## Desarrollo Local

### Opción 1: Usando scripts batch (Windows)
```bash
# Iniciar servidor de desarrollo
start-dev.bat

# O compilar para producción
build-prod.bat
```

### Opción 2: Usando comandos npm
```bash
# Servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## Puertos y URLs

- **Desarrollo**: http://localhost:3001 (o el siguiente puerto disponible)
- **Producción**: Los archivos se generan en la carpeta `dist/`

## Estructura del Proyecto

```
Motorepuestos-FL/
├── src/
│   ├── components/     # Componentes React
│   ├── store/         # Estado global con Zustand
│   ├── lib/           # Utilidades y configuración
│   └── main.tsx       # Punto de entrada
├── public/            # Archivos estáticos
├── dist/              # Build de producción
├── .env               # Variables de entorno
└── package.json       # Dependencias y scripts
```

## Solución de Problemas

### Error: "Port 3000 is in use"
- El servidor automáticamente usará el siguiente puerto disponible
- Verifica en la consola qué puerto se está usando

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Las variables deben usar el prefijo `VITE_`

### Error: "Cannot find module"
- Ejecuta `npm install` para reinstalar dependencias
- Verifica que no hay procesos de Node.js bloqueando archivos

### Archivos bloqueados en Windows
```bash
# Matar todos los procesos de Node.js
taskkill /f /im node.exe

# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
npm install
```

## Comandos Útiles

```bash
# Limpiar cache
npm cache clean --force

# Verificar dependencias
npm audit

# Actualizar dependencias
npm update

# Ejecutar linting
npm run lint

# Ejecutar tests
npm test
```

## Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Otros servicios
- Los archivos en `dist/` están listos para cualquier servidor web estático
- Configura las variables de entorno en tu plataforma de hosting

## Notas Importantes

- El proyecto usa **Vite** como bundler
- **Zustand** para manejo de estado global
- **Supabase** como backend
- **TypeScript** para tipado
- **Tailwind CSS** para estilos

## Soporte

Si encuentras problemas:
1. Verifica que todas las dependencias están instaladas
2. Revisa la consola del navegador para errores
3. Verifica que las variables de entorno están configuradas
4. Asegúrate de que Supabase está funcionando
