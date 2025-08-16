import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Store
import { useAppStore } from './store';

// Context
import { PermissionsProvider } from './context/PermissionsContext';

// Componentes base
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import OfflineIndicator from './components/OfflineIndicator';
import SimpleErrorDisplay from './components/SimpleErrorDisplay';

// Componentes de autenticación
import SupabaseAuth from './components/SupabaseAuth';

// Lazy loading de componentes para mejor performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const Productos = lazy(() => import('./components/Productos'));
const Ventas = lazy(() => import('./components/Ventas'));
const Caja = lazy(() => import('./components/Caja'));
const Clientes = lazy(() => import('./components/Clientes'));
const Empleados = lazy(() => import('./components/Empleados'));
const Reportes = lazy(() => import('./components/Reportes'));

// Componente de navegación principal
const MainLayout = lazy(() => import('./components/MainLayout'));

function App() {
  const { 
    auth, 
    checkSession, 
    signOut,
    ui,
    setCurrentModule,
    notifications,
    addNotification
  } = useAppStore();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseError, setSupabaseError] = useState(false);

  // Manejo del estado de autenticación
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error('Error inicializando aplicación:', error);
        if (error.message.includes('Supabase') || error.message.includes('Missing')) {
          setSupabaseError(true);
        }
      }
    };

    initializeApp();
  }, [checkSession]);

  // Manejo del estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification({
        type: 'success',
        title: 'Conexión Restaurada',
        message: 'Se ha restaurado la conexión a internet'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        type: 'warning',
        title: 'Sin Conexión',
        message: 'No hay conexión a internet. Algunas funciones pueden no estar disponibles.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  // Mostrar error simple si hay error de Supabase
  if (supabaseError) {
    return <SimpleErrorDisplay />;
  }

  // Componente de carga
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner-lg mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Cargando Sistema de Motorepuestos
          </h2>
          <p className="text-gray-500">
            Inicializando aplicación...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar pantalla de login
  if (!auth.session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <SupabaseAuth />
        <ToastContainer position="top-right" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PermissionsProvider permissions={auth.permissions}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Indicador de estado offline */}
            {!isOnline && <OfflineIndicator />}

            {/* Layout principal */}
            <Suspense fallback={<LoadingSpinner />}>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/ventas" element={<Ventas />} />
                  <Route path="/caja" element={<Caja />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/empleados" element={<Empleados />} />
                  <Route path="/reportes" element={<Reportes />} />
                  
                  {/* Ruta por defecto */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </Suspense>

            {/* Notificaciones */}
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </PermissionsProvider>
    </ErrorBoundary>
  );
}

export default App; 