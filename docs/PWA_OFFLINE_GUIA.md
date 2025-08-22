# 🚀 Guía de Uso - Sistema Offline PWA

## 📋 ¿Qué es la PWA Offline?

Tu sistema de motorepuestos ahora funciona **completamente sin internet** gracias a la tecnología PWA (Progressive Web App). Esto significa que puedes seguir trabajando aunque no tengas conexión a internet.

## 🎯 Características Principales

### ✅ **Funciona Sin Internet**
- Todas las operaciones principales funcionan offline
- Los datos se guardan localmente en tu navegador
- Sincronización automática cuando vuelve internet

### ✅ **Instalación Simple**
- Se instala como una aplicación normal
- Aparece un ícono en el escritorio
- Se abre en una ventana independiente

### ✅ **Sincronización Inteligente**
- Detecta automáticamente cuando hay internet
- Sincroniza datos pendientes automáticamente
- Maneja conflictos de datos automáticamente

## 📱 Cómo Instalar la PWA

### **Opción 1: Instalación Automática**
1. Abre tu sistema en el navegador
2. Aparecerá un banner azul en la parte superior
3. Haz clic en "Instalar"
4. Confirma la instalación
5. ¡Listo! Ya tienes la app instalada

### **Opción 2: Instalación Manual**
1. Abre Chrome/Edge
2. Ve a tu sistema de motorepuestos
3. Haz clic en el ícono de instalación en la barra de direcciones
4. Selecciona "Instalar"
5. Confirma la instalación

## 🔄 Cómo Funciona el Modo Offline

### **Con Internet (Funcionamiento Normal)**
- Todo funciona igual que antes
- Los datos se guardan en Supabase (nube)
- Sincronización automática cada 5 minutos

### **Sin Internet (Modo Offline)**
- La app sigue funcionando normalmente
- Los datos se guardan localmente en tu navegador
- Puedes hacer todas las operaciones:
  - ✅ Registrar ventas
  - ✅ Agregar productos
  - ✅ Buscar productos
  - ✅ Ver clientes
  - ✅ Actualizar stock

### **Cuando Vuelve Internet**
- La app detecta automáticamente la conexión
- Sincroniza todos los datos pendientes
- Te muestra una notificación de éxito

## 📊 Panel de Estado Offline

En la esquina inferior derecha verás un panel que muestra:

### **Estado de Conexión**
- 🟢 **Conectado**: Tienes internet
- 🔴 **Sin conexión**: Trabajando offline

### **Información de Sincronización**
- **Última sincronización**: Cuándo se sincronizó por última vez
- **Cambios pendientes**: Cuántos datos están esperando sincronizar

### **Botones de Acción**
- **Sincronizar**: Sincroniza manualmente
- **Forzar**: Sincronización forzada
- **📊**: Ver estadísticas offline

## 🛠️ Operaciones Disponibles Offline

### **📦 Productos**
- ✅ Buscar productos
- ✅ Ver detalles de productos
- ✅ Agregar nuevos productos
- ✅ Actualizar stock
- ✅ Editar información

### **💰 Ventas**
- ✅ Crear nuevas ventas
- ✅ Agregar productos a la venta
- ✅ Calcular totales
- ✅ Aplicar descuentos
- ✅ Generar tickets

### **👥 Clientes**
- ✅ Ver lista de clientes
- ✅ Agregar nuevos clientes
- ✅ Editar información de clientes
- ✅ Buscar clientes

### **👨‍💼 Empleados**
- ✅ Ver lista de empleados
- ✅ Ver información de empleados

## ⚠️ Limitaciones del Modo Offline

### **❌ No Disponible Offline**
- Imágenes de productos (se muestran placeholders)
- Reportes complejos
- Facturación AFIP
- Envío de emails

### **⚠️ Consideraciones**
- Los datos se guardan en el navegador (máximo ~80% del espacio libre)
- Si limpias los datos del navegador, perderás datos offline
- Cada navegador tiene su propio almacenamiento

## 🔧 Solución de Problemas

### **La app no funciona offline**
1. Verifica que esté instalada como PWA
2. Asegúrate de haber visitado la app con internet al menos una vez
3. Revisa que el Service Worker esté registrado

### **Los datos no se sincronizan**
1. Verifica tu conexión a internet
2. Haz clic en "Forzar" en el panel de estado
3. Revisa la consola del navegador para errores

### **La app está lenta**
1. Limpia el caché del navegador
2. Reinicia la aplicación
3. Verifica el espacio disponible en disco

### **Datos perdidos**
1. Verifica que no hayas limpiado los datos del navegador
2. Revisa si hay datos pendientes de sincronización
3. Contacta al administrador del sistema

## 📈 Estadísticas Offline

Puedes ver estadísticas de tu almacenamiento offline:

1. Haz clic en el botón 📊 en el panel de estado
2. Verás información como:
   - Número de productos almacenados
   - Número de ventas pendientes
   - Número de clientes
   - Espacio utilizado

## 🔄 Sincronización Manual

### **Cuándo Sincronizar Manualmente**
- Después de un largo período offline
- Si hay muchos cambios pendientes
- Si sospechas problemas de sincronización

### **Cómo Sincronizar**
1. Asegúrate de tener internet
2. Haz clic en "Sincronizar" en el panel de estado
3. Espera a que termine el proceso
4. Verifica que no hay errores

## 🎯 Mejores Prácticas

### **Para Uso Diario**
- Instala la PWA en todos los dispositivos que uses
- Sincroniza regularmente cuando tengas internet
- Verifica el estado de sincronización antes de cerrar

### **Para Administradores**
- Monitorea el espacio de almacenamiento
- Configura respaldos regulares
- Capacita al personal en el uso offline

### **Para Mantenimiento**
- Limpia datos antiguos periódicamente
- Actualiza la aplicación regularmente
- Monitorea errores de sincronización

## 🆘 Soporte Técnico

Si tienes problemas con la funcionalidad offline:

1. **Revisa esta guía** primero
2. **Verifica la consola** del navegador para errores
3. **Contacta al administrador** del sistema
4. **Proporciona información** sobre:
   - Navegador y versión
   - Sistema operativo
   - Pasos para reproducir el problema
   - Capturas de pantalla si es posible

---

## 🎉 ¡Disfruta de tu Sistema Offline!

Tu sistema de motorepuestos ahora es más robusto y confiable. Ya no dependes de internet para trabajar y puedes estar tranquilo sabiendo que tus datos están seguros y se sincronizarán automáticamente.
