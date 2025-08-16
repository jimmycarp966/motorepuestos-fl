#!/usr/bin/env node

/**
 * Script de verificación rápida para configuración local
 * Ejecutar: node check-local-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración local...\n');

// 1. Verificar archivo .env.local
console.log('1. Verificando archivo .env.local...');
const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ .env.local existe y tiene las variables de Supabase');
  } else {
    console.log('❌ .env.local existe pero faltan variables de Supabase');
    console.log('   Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
  }
} else {
  console.log('❌ .env.local no existe');
  console.log('   Crea el archivo .env.local con las variables de Supabase');
}

// 2. Verificar package.json
console.log('\n2. Verificando package.json...');
const packagePath = path.join(__dirname, 'package.json');

if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
  
  if (hasDependencies) {
    console.log('✅ package.json existe y tiene dependencias');
  } else {
    console.log('❌ package.json existe pero no tiene dependencias');
  }
} else {
  console.log('❌ package.json no existe');
}

// 3. Verificar node_modules
console.log('\n3. Verificando node_modules...');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules existe');
} else {
  console.log('❌ node_modules no existe');
  console.log('   Ejecuta: npm install');
}

// 4. Verificar archivos SQL
console.log('\n4. Verificando archivos SQL...');
const sqlFiles = ['supabase-functions.sql'];

sqlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

// 5. Verificar estructura de componentes
console.log('\n5. Verificando estructura de componentes...');
const componentsPath = path.join(__dirname, 'src', 'components');
const requiredComponents = [
  'auth/LoginForm.tsx',
  'productos/ProductosTable.tsx',
  'ventas/VentaForm.tsx',
  'caja/CajaTable.tsx',
  'clientes/ClientesTable.tsx',
  'empleados/EmpleadosTable.tsx',
  'dashboard/Dashboard.tsx',
  'reportes/ReportesTable.tsx'
];

let componentsOk = 0;
requiredComponents.forEach(component => {
  const componentPath = path.join(componentsPath, component);
  if (fs.existsSync(componentPath)) {
    componentsOk++;
  } else {
    console.log(`❌ ${component} no existe`);
  }
});

if (componentsOk === requiredComponents.length) {
  console.log(`✅ Todos los componentes principales existen (${componentsOk}/${requiredComponents.length})`);
} else {
  console.log(`⚠️ Faltan algunos componentes (${componentsOk}/${requiredComponents.length})`);
}

// 6. Verificar store
console.log('\n6. Verificando store Zustand...');
const storePath = path.join(__dirname, 'src', 'store');
const storeFiles = ['index.ts', 'slices/authSlice.ts', 'slices/productosSlice.ts'];

let storeOk = 0;
storeFiles.forEach(file => {
  const filePath = path.join(storePath, file);
  if (fs.existsSync(filePath)) {
    storeOk++;
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

if (storeOk === storeFiles.length) {
  console.log(`✅ Store configurado correctamente (${storeOk}/${storeFiles.length})`);
} else {
  console.log(`⚠️ Faltan archivos del store (${storeOk}/${storeFiles.length})`);
}

// Resumen final
console.log('\n📋 RESUMEN DE CONFIGURACIÓN LOCAL');
console.log('=====================================');

const checks = [
  { name: 'Variables de entorno', ok: fs.existsSync(envPath) },
  { name: 'Dependencias', ok: fs.existsSync(nodeModulesPath) },
  { name: 'Archivos SQL', ok: sqlFiles.every(f => fs.existsSync(path.join(__dirname, f))) },
  { name: 'Componentes', ok: componentsOk === requiredComponents.length },
  { name: 'Store', ok: storeOk === storeFiles.length }
];

const passedChecks = checks.filter(c => c.ok).length;

checks.forEach(check => {
  console.log(`${check.ok ? '✅' : '❌'} ${check.name}`);
});

console.log(`\n🎯 Resultado: ${passedChecks}/${checks.length} verificaciones pasaron`);

if (passedChecks === checks.length) {
  console.log('\n✅ ¡Configuración local lista!');
  console.log('   Puedes ejecutar: npm run dev');
} else {
  console.log('\n⚠️ Hay problemas que resolver antes de continuar');
  console.log('   Revisa los errores arriba y sigue las instrucciones');
}

console.log('\n📖 Para más detalles, consulta: SETUP_LOCAL.md');
