import React, { useState, useEffect } from 'react'
import { useAppStore } from './store'
import { LoginForm } from './components/auth/LoginForm'
import { Sidebar } from './components/layout/Sidebar'

import { Dashboard } from './components/dashboard/Dashboard'
import { EmpleadosTable } from './components/empleados/EmpleadosTable'
import { ProductosTable } from './components/productos/ProductosTable'
import { ClientesTable } from './components/clientes/ClientesTable'
import { VentasTable } from './components/ventas/VentasTable'
import { CajaTable } from './components/caja/CajaTable'
import { ReportesTable } from './components/reportes/ReportesTable'
import { Calendario } from './components/calendario/Calendario'
import { NotificationsContainer } from './components/ui/notifications'
import { ConnectionError } from './components/ui/ConnectionError'
import { DebugButton } from './components/ui/DebugButton'
import { DebugVentasSimple } from './components/ui/DebugVentasSimple'
import { DebugVentasCompleto } from './components/ui/DebugVentasCompleto'

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
        console.log('🔍 App: Iniciando verificación de autenticación...')
        await checkAuth()
        setDebugInfo(prev => ({ ...prev, authChecked: true }))
        console.log('✅ App: Verificación de autenticación completada')
        
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

  // Cargar datos según el módulo activo
  useEffect(() => {
    console.log('🔄 [App] Módulo cambió a:', currentModule)
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
    console.log('🎯 [App] Renderizando módulo:', currentModule, 'Usuario:', user?.nombre)
    
    switch (currentModule) {
      case 'dashboard':
        console.log('🎯 [App] Renderizando Dashboard')
        return <Dashboard />
      case 'empleados':
        console.log('🎯 [App] Renderizando EmpleadosTable')
        return <EmpleadosTable />
      case 'productos':
        console.log('🎯 [App] Renderizando ProductosTable')
        return <ProductosTable />
      case 'clientes':
        console.log('🎯 [App] Renderizando ClientesTable')
        return <ClientesTable />
      case 'ventas':
        console.log('🎯 [App] Renderizando VentasTable - INICIO')
        const ventasComponent = <VentasTable />
        console.log('🎯 [App] VentasTable creado:', ventasComponent)
        return ventasComponent
      case 'caja':
        console.log('🎯 [App] Renderizando CajaTable')
        return <CajaTable />
      case 'calendario':
        console.log('🎯 [App] Renderizando Calendario')
        return <Calendario />
      case 'reportes':
        console.log('🎯 [App] Renderizando ReportesTable')
        return <ReportesTable />
      default:
        console.log('🎯 [App] Renderizando Dashboard (default)')
        return <Dashboard />
    }
  }

  // Debug: Mostrar información de estado
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 App: Renderizando con estado:', { loading, user, debugInfo })
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
      <>
        <LoginForm />
        <DebugButton />
      </>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex'
    }}>
      <NotificationsContainer />
      <DebugButton />
      
      {/* Sidebar fijo */}
      <Sidebar />
      
      {/* Contenido principal */}
      <main style={{
        flex: 1,
        marginLeft: '280px',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        {/* Header moderno */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0
            }}>
                             {currentModule === 'dashboard' ? 'Dashboard' :
                currentModule === 'empleados' ? 'Empleados' :
                currentModule === 'productos' ? 'Productos' :
                currentModule === 'clientes' ? 'Clientes' :
                currentModule === 'ventas' ? 'Ventas' :
                currentModule === 'caja' ? 'Caja' :
                currentModule === 'calendario' ? 'Calendario' :
                currentModule === 'reportes' ? 'Reportes' : 'Dashboard'}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Bienvenido
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1e293b' }}>
                {user.nombre}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              {user.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido del módulo */}
        <div style={{ 
          padding: '2rem',
          maxWidth: '100%',
          overflowX: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {renderModule()}
          </div>
        </div>
      </main>
      {/* Botón de debug */}
      <DebugButton />
      
      {/* Debug de ventas */}
      <DebugVentasSimple />
      
      {/* Debug completo de ventas */}
      <DebugVentasCompleto />
    </div>
  )
}

export default App
