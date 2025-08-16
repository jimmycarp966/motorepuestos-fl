#!/usr/bin/env node

/**
 * Script para configurar variables de entorno
 * Ejecutar: node setup-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variables de entorno...\n');

const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# App Configuration
VITE_APP_NAME=Motorepuestos F.L.
VITE_APP_VERSION=1.0.0

# Development
VITE_DEBUG_MODE=true
VITE_API_TIMEOUT=30000

# Notifications
VITE_NOTIFICATION_DURATION=5000
VITE_MAX_NOTIFICATIONS=5
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️ El archivo .env.local ya existe');
  console.log('   Edítalo manualmente con tus credenciales de Supabase');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local creado');
}

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. Ve a https://supabase.com y crea un proyecto');
console.log('2. Ve a Settings > API en tu proyecto');
console.log('3. Copia la URL y API Key');
console.log('4. Edita el archivo .env.local con tus credenciales:');
console.log('   - VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
console.log('   - VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui');
console.log('\n5. Ejecuta los scripts SQL en Supabase:');
console.log('   - supabase-functions.sql');
console.log('\n6. Ejecuta: npm run dev');
console.log('\n📖 Para más detalles, consulta: SETUP_LOCAL.md');
