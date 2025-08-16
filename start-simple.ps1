# Script simple para iniciar el servidor
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Green

# Buscar Node.js
$nodePath = "C:\Program Files\nodejs\node.exe"
if (Test-Path $nodePath) {
    Write-Host "Node.js encontrado" -ForegroundColor Green
} else {
    Write-Host "Node.js no encontrado en C:\Program Files\nodejs\" -ForegroundColor Red
    exit 1
}

# Buscar npm
$npmPath = "C:\Program Files\nodejs\npm.cmd"
if (Test-Path $npmPath) {
    Write-Host "npm encontrado" -ForegroundColor Green
} else {
    Write-Host "npm no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar dependencias
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    & $npmPath install
}

# Iniciar servidor
Write-Host "Iniciando servidor en http://localhost:3000..." -ForegroundColor Green
& $npmPath run dev
