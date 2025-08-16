# Script para iniciar el servidor de desarrollo
Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor Green

# Buscar Node.js en ubicaciones comunes
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

$nodePath = $null
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodePath = $path
        Write-Host "✅ Node.js encontrado en: $path" -ForegroundColor Green
        break
    }
}

if (-not $nodePath) {
    Write-Host "❌ Node.js no encontrado. Intentando instalar..." -ForegroundColor Red
    
    # Intentar instalar Node.js con winget
    try {
        winget install OpenJS.NodeJS
        Write-Host "✅ Node.js instalado. Por favor, reinicia PowerShell y ejecuta este script nuevamente." -ForegroundColor Green
        exit
    } catch {
        Write-Host "❌ Error instalando Node.js. Por favor, instálalo manualmente desde https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
}

# Buscar npm
$npmPaths = @(
    "C:\Program Files\nodejs\npm.cmd",
    "C:\Program Files (x86)\nodejs\npm.cmd",
    "$env:APPDATA\npm\npm.cmd"
)

$npmPath = $null
foreach ($path in $npmPaths) {
    if (Test-Path $path) {
        $npmPath = $path
        Write-Host "✅ npm encontrado en: $path" -ForegroundColor Green
        break
    }
}

if (-not $npmPath) {
    Write-Host "❌ npm no encontrado. Usando Node.js directamente..." -ForegroundColor Yellow
    $npmPath = $nodePath
}

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    try {
        & $npmPath install
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}

# Iniciar servidor de desarrollo
Write-Host "🌐 Iniciando servidor en http://localhost:3000..." -ForegroundColor Green
try {
    & $npmPath run dev
} catch {
    Write-Host "❌ Error iniciando servidor" -ForegroundColor Red
    exit 1
}
