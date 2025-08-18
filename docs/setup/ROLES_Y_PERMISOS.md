# 🔐 Roles y Permisos del Sistema - Motorepuestos FL

## 📋 Información de Configuración

### **Credenciales del Sistema**
- **Supabase URL:** https://hsajhnxtlgfpkpzcrjyb.supabase.co
- **Supabase Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWpobnh0bGdmcGtwemNyanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc2NDUsImV4cCI6MjA3MDgzMzY0NX0.QAe7NTVEervkqmq2zFvCsABFulvEM2Q0UgZ4EntMoj4
- **Aplicación Vercel:** https://motorepuestos-x8myqv0ll-daniels-projects-756b8385.vercel.app
- **Repositorio GitHub:** https://github.com/jimmycarp966/motorepuestos-fl

## 👥 Roles del Sistema

### **Roles Disponibles en la Constraint**
La tabla `empleados` tiene una constraint que permite estos roles exactos:

```sql
CHECK (rol IN (
    'Vendedor',
    'Técnico', 
    'Almacén',
    'Administrador',
    'Gerente',
    'Cajero'
))
```

### **Jerarquía de Roles**

#### **1. Administrador** (Máximo Privilegio)
- **Acceso completo** a todas las funcionalidades
- **Gestión de empleados** y asignación de roles
- **Configuración del sistema**
- **Reportes completos**
- **Dashboard completo**

#### **2. Gerente**
- **Gestión de ventas** y productos
- **Reportes de negocio**
- **Gestión de clientes**
- **Dashboard limitado**

#### **3. Vendedor**
- **Registro de ventas**
- **Consulta de productos**
- **Gestión básica de clientes**
- **Dashboard básico**

#### **4. Técnico**
- **Gestión de productos**
- **Control de inventario**
- **Reportes técnicos**

#### **5. Almacén**
- **Gestión de inventario**
- **Control de stock**
- **Reportes de almacén**

#### **6. Cajero**
- **Operaciones de caja**
- **Registro de pagos**
- **Arqueo de caja**

## 🔧 Scripts de Referencia

### **Script para Asignar Rol de Administrador**
```sql
-- Script para asignar rol de administrador
UPDATE auth.users 
SET role = 'admin'
WHERE email = 'usuario@ejemplo.com';

UPDATE empleados 
SET 
    rol = 'Administrador',
    activo = true,
    updated_at = NOW()
WHERE email = 'usuario@ejemplo.com';

INSERT INTO empleados (
    id,
    nombre,
    email,
    rol,
    activo,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'Nombre Usuario',
    'usuario@ejemplo.com',
    'Administrador',
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'usuario@ejemplo.com'
AND NOT EXISTS (
    SELECT 1 FROM empleados e WHERE e.email = 'usuario@ejemplo.com'
);
```

### **Script para Verificar Usuario**
```sql
-- Verificar configuración de usuario
SELECT 
    u.email,
    u.role as auth_role,
    e.rol as empleado_rol,
    e.activo
FROM auth.users u
LEFT JOIN empleados e ON u.id = e.id
WHERE u.email = 'usuario@ejemplo.com';
```

### **Script para Verificar Constraint**
```sql
-- Verificar constraint de roles
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname = 'empleados_rol_check';
```

## 📊 Usuarios Administradores Actuales

### **Usuario Principal**
- **Email:** dani@fl.com
- **Auth Role:** admin
- **Empleado Rol:** Administrador
- **Estado:** Activo
- **Fecha de Configuración:** 16/08/2025

## 🚨 Solución de Problemas

### **Error: Constraint Violation**
Si obtienes error de constraint al asignar roles:

1. **Verificar valores permitidos:**
```sql
SELECT DISTINCT rol FROM empleados ORDER BY rol;
```

2. **Verificar constraint exacta:**
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'empleados'::regclass 
AND conname = 'empleados_rol_check';
```

3. **Usar valores exactos** (con mayúsculas/minúsculas correctas)

### **Error: Usuario No Encontrado**
Si el usuario no existe en auth.users:

1. **Crear usuario primero** en Supabase Auth
2. **Luego asignar rol** usando los scripts

### **Error: Acceso Limitado**
Si el usuario tiene rol pero acceso limitado:

1. **Verificar rol en auth.users** (debe ser 'admin')
2. **Verificar rol en empleados** (debe ser 'Administrador')
3. **Verificar que esté activo** (activo = true)
4. **Cerrar y volver a iniciar sesión**

## 📁 Archivos de Referencia

### **Scripts Creados**
- `final-admin-fix.sql` - Script para asignar administrador
- `check-constraint.sql` - Verificar constraint de roles
- `exact-constraint.sql` - Ver constraint exacta
- `debug-constraint.sql` - Debug de constraint

### **Documentación**
- `ROLES_Y_PERMISOS.md` - Este archivo
- `VERCEL_CONFIG.md` - Configuración de Vercel
- `README.md` - Documentación general

## 🔄 Proceso de Asignación de Roles

### **Paso a Paso**
1. **Verificar que el usuario existe** en auth.users
2. **Asignar rol en auth.users** (admin para administradores)
3. **Crear/actualizar perfil en empleados** con rol correcto
4. **Verificar configuración** con script de verificación
5. **Probar acceso** en la aplicación

### **Comandos Rápidos**
```bash
# Verificar usuario
SELECT * FROM auth.users WHERE email = 'usuario@ejemplo.com';

# Verificar empleado
SELECT * FROM empleados WHERE email = 'usuario@ejemplo.com';

# Asignar administrador
UPDATE auth.users SET role = 'admin' WHERE email = 'usuario@ejemplo.com';
UPDATE empleados SET rol = 'Administrador', activo = true WHERE email = 'usuario@ejemplo.com';
```

## 📞 Contacto y Soporte

### **Información del Proyecto**
- **Proyecto:** Motorepuestos FL
- **Desarrollador:** jimmycarp966
- **Fecha de Creación:** 16/08/2025
- **Versión:** 1.0.1

### **Enlaces Útiles**
- **Supabase Dashboard:** https://supabase.com/dashboard/project/hsajhnxtlgfpkpzcrjyb
- **Vercel Dashboard:** https://vercel.com/daniels-projects-756b8385/motorepuestos-fl
- **GitHub Repository:** https://github.com/jimmycarp966/motorepuestos-fl

---

**📝 Nota:** Este archivo debe mantenerse actualizado con cualquier cambio en roles o permisos del sistema.
