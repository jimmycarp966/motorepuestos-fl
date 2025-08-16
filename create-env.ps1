# Script para crear el archivo .env
Write-Host "Creando archivo .env..." -ForegroundColor Green

$envContent = @"
# Configuración de Supabase
VITE_SUPABASE_URL=https://hsajhnxtlgfpkpzcrjyb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4

# Configuración de la aplicación
VITE_APP_NAME=Motorepuestos F.L.
VITE_APP_VERSION=1.0.0

# Configuración de desarrollo
VITE_DEBUG_MODE=true
VITE_API_TIMEOUT=30000

# Configuración de notificaciones
VITE_NOTIFICATION_DURATION=5000
VITE_MAX_NOTIFICATIONS=5
"@

try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Archivo .env creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creando archivo .env: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Reiniciando servidor de desarrollo..." -ForegroundColor Yellow
Write-Host "Por favor, detén el servidor actual (Ctrl+C) y ejecuta: npm run dev" -ForegroundColor Yellow
