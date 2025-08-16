#!/usr/bin/env node

/**
 * Script para actualizar variables de entorno con credenciales reales
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Actualizando variables de entorno con credenciales reales...\n');

const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://hsajhnxtlgfpkpzcrjyb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4

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

fs.writeFileSync(envPath, envContent);
console.log('✅ Archivo .env.local actualizado con credenciales reales');

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. Ejecuta los scripts SQL en Supabase:');
console.log('   - Ve al SQL Editor en tu proyecto');
console.log('   - Ejecuta el contenido de supabase-functions.sql');
console.log('\n2. Inicia el servidor de desarrollo:');
console.log('   npm run dev');
console.log('\n3. Ve a http://localhost:3000');
console.log('\n4. Verifica que no hay errores en la consola del navegador');
