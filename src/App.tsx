import React, { useState, useEffect } from 'react'
import { useAppStore } from './store'
import { initializeCalendarSync } from './lib/calendarSync'
import { LoginForm } from './components/auth/LoginForm'
import { Sidebar } from './components/layout/Sidebar'

import { Dashboard } from './components/dashboard/Dashboard'
import { EmpleadosTable } from './components/empleados/EmpleadosTable'
import { ProductosTable } from './components/productos/ProductosTable'
import { ClientesTable } from './components/clientes/ClientesTable'
import { VentasModernView } from './components/ventas/VentasModernView'
import { CajaTable } from './components/caja/CajaTable'
import ReportesTable from './components/reportes/ReportesTable'
import { NotificationsContainer } from './components/ui/notifications'
import { ConnectionError } from './components/ui/ConnectionError'
import { ShortcutsHelp } from './components/ui/ShortcutsHelp'

import { Footer } from './components/ui/Footer'

function App() {
  const user = useAppStore((state) => state.auth.user)
  const loading = useAppStore((state) => state.auth.loading)
  const checkAuth = useAppStore((state) => state.checkAuth)
  const currentModule = useAppStore((state) => state.ui.currentModule)
  
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

  // Renderizar módulo correspondiente
  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />
      case 'empleados':
        return <EmpleadosTable />
      case 'productos':
        return <ProductosTable />
      case 'clientes':
        return <ClientesTable />
      case 'ventas':
        return <VentasModernView />
      case 'caja':
        return <CajaTable />
      case 'reportes':
        return <ReportesTable />
      default:
        return <Dashboard />
    }
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ marginBottom: '10px', fontSize: '1.5rem', fontWeight: '600' }}>
            Cargando aplicación...
          </h2>
          <p style={{ opacity: 0.8, fontSize: '1rem' }}>
            Inicializando sistema de gestión
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '1rem', fontSize: '12px', opacity: 0.8 }}>
              <p>Debug: Auth checked: {debugInfo.authChecked ? '✅' : '⏳'}</p>
              {debugInfo.authError && <p>Error: {debugInfo.authError}</p>}
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <NotificationsContainer />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal */}
      <main className="flex flex-col lg:ml-[280px] min-h-screen">
        {/* Header moderno */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
              {currentModule === 'dashboard' ? 'Dashboard' :
               currentModule === 'empleados' ? 'Empleados' :
               currentModule === 'productos' ? 'Productos' :
               currentModule === 'clientes' ? 'Clientes' :
               currentModule === 'ventas' ? 'Ventas' :
               currentModule === 'caja' ? 'Caja' :
               currentModule === 'reportes' ? 'Reportes' : 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-gray-500">
                Bienvenido
              </div>
              <div className="text-base font-medium text-gray-900">
                {user.nombre}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido del módulo */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {renderModule()}
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </main>

      {/* Ayuda de Shortcuts - Botón flotante */}
      <ShortcutsHelp />
    </div>
  )
}

export default App
