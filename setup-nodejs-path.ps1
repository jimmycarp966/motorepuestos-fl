# Script para configurar Node.js en el PATH permanentemente
Write-Host "Configurando Node.js en el PATH del sistema..." -ForegroundColor Green

# Verificar si Node.js está instalado
$nodePath = "C:\Program Files\nodejs\node.exe"
if (-not (Test-Path $nodePath)) {
    Write-Host "Error: Node.js no encontrado en C:\Program Files\nodejs\" -ForegroundColor Red
    Write-Host "Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Node.js encontrado en: $nodePath" -ForegroundColor Green

# Obtener el PATH actual del usuario
$currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)

# Verificar si Node.js ya está en el PATH
if ($currentPath -like "*C:\Program Files\nodejs*") {
    Write-Host "Node.js ya está configurado en el PATH" -ForegroundColor Yellow
} else {
    # Agregar Node.js al PATH
    $newPath = $currentPath + ";C:\Program Files\nodejs"
    
    try {
        [Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::User)
        Write-Host "Node.js agregado al PATH exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "Error: No se pudo configurar el PATH" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Intentar con permisos elevados
        Write-Host "Intentando con permisos de administrador..." -ForegroundColor Yellow
        try {
            Start-Process powershell -ArgumentList "-Command", "& {[Environment]::SetEnvironmentVariable('PATH', '$newPath', [EnvironmentVariableTarget]::User)}" -Verb RunAs
            Write-Host "Comando ejecutado con permisos elevados" -ForegroundColor Green
        } catch {
            Write-Host "Error: No se pudieron obtener permisos de administrador" -ForegroundColor Red
        }
    }
}

# Actualizar PATH en la sesión actual
$env:PATH += ";C:\Program Files\nodejs"

Write-Host ""
Write-Host "Configuracion completada!" -ForegroundColor Green
Write-Host "Para verificar, ejecuta:" -ForegroundColor Yellow
Write-Host "  node --version" -ForegroundColor White
Write-Host "  npm --version" -ForegroundColor White
Write-Host ""
Write-Host "Nota: Es posible que necesites reiniciar PowerShell/CMD para que los cambios tomen efecto" -ForegroundColor Yellow
Write-Host ""

# Verificar que funciona
try {
    $nodeVersion = & "C:\Program Files\nodejs\node.exe" --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error verificando Node.js: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $npmVersion = & "C:\Program Files\nodejs\npm.cmd" --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error verificando npm: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "Presiona Enter para continuar"
