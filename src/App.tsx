import React, { useState, useEffect, Suspense, lazy } from 'react'
import { useAppStore } from './store'
import { initializeCalendarSync } from './lib/calendarSync'
import { LoginForm } from './components/auth/LoginForm'
import { Sidebar } from './components/layout/Sidebar'
import { usePermissionGuard } from './hooks/usePermissionGuard'

// Lazy loading de componentes para mejor performance
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })))
const EmpleadosTable = lazy(() => import('./components/empleados/EmpleadosTable').then(module => ({ default: module.EmpleadosTable })))
const ProductosTable = lazy(() => import('./components/productos/ProductosTable').then(module => ({ default: module.ProductosTable })))
const ClientesTable = lazy(() => import('./components/clientes/ClientesTable').then(module => ({ default: module.ClientesTable })))
const VentasTableModern = lazy(() => import('./components/ventas/VentasTableModern').then(module => ({ default: module.VentasTableModern })))
const FacturacionTable = lazy(() => import('./components/facturacion/FacturacionTable').then(module => ({ default: module.FacturacionTable })))
const CajaTable = lazy(() => import('./components/caja/CajaTable').then(module => ({ default: module.CajaTable })))
const ReportesTable = lazy(() => import('./components/reportes/ReportesTable'))

import { NotificationsContainer } from './components/ui/notifications'
import { ConnectionError } from './components/ui/ConnectionError'
import { AccessDenied } from './components/ui/AccessDenied'

import { Footer } from './components/ui/Footer'
import { OfflineStatus } from './components/OfflineStatus'

// Componente de loading simple para lazy loading
const LoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    <span className="ml-3 text-dark-text-secondary">Cargando...</span>
  </div>
)

function App() {
  const user = useAppStore((state) => state.auth.user)
  const loading = useAppStore((state) => state.auth.loading)
  const checkAuth = useAppStore((state) => state.checkAuth)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)
  const permissions = usePermissionGuard()
  
  // Estado de debug y manejo de errores
  const [debugInfo, setDebugInfo] = useState({
    authChecked: false,
    authError: null as string | null,
    storeState: null as any,
    connectionError: null as string | null
  })
  
  // Acciones para cargar datos
  const fetchEmpleados = useAppStore((state) => state.fetchEmpleados)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const fetchVentas = useAppStore((state) => state.fetchVentas)
  const fetchFacturas = useAppStore((state) => state.fetchFacturas)
  const fetchMovimientos = useAppStore((state) => state.fetchMovimientos)

  useEffect(() => {
    const performSystemCheck = async () => {
      try {
        await checkAuth()
        setDebugInfo(prev => ({ ...prev, authChecked: true }))
        
      } catch (error) {
        console.error('❌ App: Error en verificación del sistema:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        setDebugInfo(prev => ({ 
          ...prev, 
          authChecked: true, 
          authError: errorMessage,
          connectionError: errorMessage.includes('Missing Supabase') || errorMessage.includes('connection') ? errorMessage : null
        }))
      }
    }
    
    performSystemCheck()
  }, [checkAuth])

  // Log del estado actual
  useEffect(() => {
    setDebugInfo(prev => ({ ...prev, storeState: { loading, user } }))
  }, [loading, user])

  // Inicializar sistema de sincronización de calendario
  useEffect(() => {
    if (user) {
      console.log('🔄 [App] Inicializando sistema de sincronización de calendario...')
      initializeCalendarSync(useAppStore)
    }
  }, [user])

  // Establecer el primer módulo disponible cuando el usuario se autentica
  useEffect(() => {
    if (user && currentModule === 'dashboard') {
      // Verificar si el usuario puede acceder al dashboard
      const canAccessDashboard = permissions.canAccess('dashboard')
      if (!canAccessDashboard) {
        const firstAvailableModule = permissions.getFirstAvailableModule()
        console.log(`🔄 [App] Usuario no puede acceder al dashboard, redirigiendo a: ${firstAvailableModule}`)
        setCurrentModule(firstAvailableModule)
      }
    }
  }, [user, currentModule, permissions, setCurrentModule])

  // Cargar datos según el módulo activo
  useEffect(() => {
    if (!user) return

    const loadModuleData = async () => {
      try {
        switch (currentModule) {
          case 'empleados':
            await fetchEmpleados()
            break
          case 'productos':
            await fetchProductos()
            break
          case 'clientes':
            await fetchClientes()
            break
          case 'ventas':
            await fetchVentas()
            break
          case 'facturacion':
            await fetchFacturas()
            break
          case 'caja':
            await fetchMovimientos()
            break
          case 'reportes':
            // Los reportes se calculan en tiempo real
            break
          default:
            // Dashboard carga todos los datos necesarios
            await Promise.all([
              fetchVentas(),
              fetchMovimientos(),
              fetchProductos(),
              fetchClientes()
            ])
        }
      } catch (error) {
        console.error('Error cargando datos del módulo:', error)
      }
    }

    loadModuleData()
  }, [currentModule, user, fetchEmpleados, fetchProductos, fetchClientes, fetchVentas, fetchMovimientos])

  // Renderizar módulo correspondiente con lazy loading
  const renderModule = () => {
    // Verificar si el usuario tiene permisos para el módulo actual
    if (!permissions.canAccess(currentModule as any)) {
      return <AccessDenied module={currentModule} />
    }

    const ModuleComponent = (() => {
      switch (currentModule) {
        case 'dashboard': return Dashboard
        case 'empleados': return EmpleadosTable
        case 'productos': return ProductosTable
        case 'clientes': return ClientesTable
        case 'ventas': return VentasTableModern
        case 'facturacion': return FacturacionTable
        case 'caja': return CajaTable
        case 'reportes': return ReportesTable
        default: return Dashboard
      }
    })()

    return (
      <Suspense fallback={<LoadingComponent />}>
        <ModuleComponent />
      </Suspense>
    )
  }



  // Mostrar error de conexión si existe
  if (debugInfo.connectionError) {
    return (
      <ConnectionError 
        error={debugInfo.connectionError}
        onRetry={() => {
          setDebugInfo(prev => ({ ...prev, connectionError: null, authError: null }))
          window.location.reload()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #000000 0%, #121212 50%, #1E1E1E 100%)',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #2C2C2C',
            borderTop: '4px solid #2979FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(41, 121, 255, 0.3)'
          }}></div>
          <h2 style={{ marginBottom: '10px', fontSize: '1.5rem', fontWeight: '600', color: '#FFFFFF' }}>
            Cargando Motorepuestos...
          </h2>
          <p style={{ opacity: 0.8, fontSize: '1rem', color: '#B0B0B0' }}>
            Inicializando sistema de gestión
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '1rem', fontSize: '12px', opacity: 0.8, color: '#B0B0B0' }}>
              <p>Debug: Auth checked: {debugInfo.authChecked ? '✅' : '⏳'}</p>
              {debugInfo.authError && <p style={{ color: '#F44336' }}>Error: {debugInfo.authError}</p>}
            </div>
          )}
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return (
             <LoginForm />
    )
  }

    return (
    <div className="min-h-screen bg-dark-bg-primary font-sans">
      <NotificationsContainer />

      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal */}
      <main className="flex flex-col lg:ml-[280px] min-h-screen">
        {/* Header moderno tema oscuro */}
        <header className="bg-dark-bg-secondary border-b border-dark-border px-4 lg:px-8 py-4 flex items-center justify-between shadow-dark-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl lg:text-2xl font-semibold text-dark-text-primary">
              Punto de Venta – Motorepuestos
            </h1>
            <div className="text-sm text-dark-text-secondary font-medium">
              {currentModule === 'dashboard' ? 'Dashboard' :
               currentModule === 'empleados' ? 'Empleados' :
               currentModule === 'productos' ? 'Productos' :
               currentModule === 'clientes' ? 'Clientes' :
               currentModule === 'ventas' ? 'Ventas' :
               currentModule === 'facturacion' ? 'Facturación' :
               currentModule === 'caja' ? 'Caja' :
               currentModule === 'reportes' ? 'Reportes' : 'Dashboard'}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-dark-text-secondary">
                Bienvenido
              </div>
              <div className="text-base font-medium text-dark-text-primary">
                {user.nombre}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-lg shadow-glow-blue">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido del módulo */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="bg-dark-bg-secondary rounded-xl shadow-dark-md border border-dark-border overflow-hidden">
            {renderModule()}
          </div>
        </div>
        
                 {/* Footer */}
         <Footer />
       </main>

       {/* Componente de estado offline */}
       <OfflineStatus />
     </div>
  )
}

export default App
