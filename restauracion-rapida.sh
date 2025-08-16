#!/bin/bash

echo "========================================"
echo "    SISTEMA DE RESTAURACION RAPIDA"
echo "========================================"
echo

echo "[1/5] Deteniendo servidor de desarrollo..."
pkill -f "vite" 2>/dev/null || true
echo "✓ Servidor detenido"

echo
echo "[2/5] Restaurando al punto funcional..."
git checkout PUNTO_RESTAURACION_FUNCIONAL_ACTUAL
if [ $? -ne 0 ]; then
    echo "❌ Error: No se pudo restaurar al punto funcional"
    echo "Verificando tags disponibles..."
    git tag -l "*RESTAURACION*"
    exit 1
fi
echo "✓ Restauración completada"

echo
echo "[3/5] Limpiando dependencias..."
rm -rf node_modules package-lock.json
echo "✓ Dependencias limpiadas"

echo
echo "[4/5] Reinstalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: No se pudieron instalar las dependencias"
    exit 1
fi
echo "✓ Dependencias instaladas"

echo
echo "[5/5] Iniciando servidor de desarrollo..."
echo
echo "========================================"
echo "    RESTAURACION COMPLETADA"
echo "========================================"
echo
echo "✅ El proyecto ha sido restaurado al estado funcional"
echo "✅ Iniciando servidor en http://localhost:5173"
echo
echo "Para verificar funcionalidad:"
echo "1. Abrir http://localhost:5173"
echo "2. Hacer login con cualquier usuario"
echo "3. Navegar entre módulos"
echo "4. Verificar dashboard"
echo
echo "Presiona Ctrl+C para detener el servidor"
echo

npm run dev
