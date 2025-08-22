import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Info } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showManualInstall, setShowManualInstall] = useState(false);

  useEffect(() => {
    console.log('🔍 PWAInstallBanner: Iniciando verificación...');

    // Limpiar localStorage descartado para forzar mostrar banner
    localStorage.removeItem('pwa-banner-dismissed');
    console.log('🧹 PWAInstallBanner: localStorage limpiado');

    // Verificar si ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    console.log('📱 PWAInstallBanner: ¿Ya instalada?', isInstalled);

    if (isInstalled) {
      console.log('✅ PWAInstallBanner: PWA ya instalada, no mostrar banner');
      return;
    }

    // Verificar si el navegador soporta PWA
    const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
    console.log('🌐 PWAInstallBanner: ¿Soporta PWA?', supportsPWA);

    if (!supportsPWA) {
      console.log('❌ PWAInstallBanner: Navegador no soporta PWA');
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 PWAInstallBanner: beforeinstallprompt disparado');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Escuchar si ya fue instalada
    const handleAppInstalled = () => {
      console.log('✅ PWAInstallBanner: PWA instalada exitosamente');
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    // Mostrar banner manual después de un delay más corto
    setTimeout(() => {
      if (!isInstalled && supportsPWA) {
        console.log('📢 PWAInstallBanner: Mostrando banner manual');
        setShowManualInstall(true);
        setShowBanner(true);
      }
    }, 2000); // Reducido a 2 segundos

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        console.log('🚀 PWAInstallBanner: Iniciando instalación automática...');
        // Mostrar el prompt de instalación
        deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('✅ PWAInstallBanner: Usuario aceptó instalar la PWA');
          setShowBanner(false);
        } else {
          console.log('❌ PWAInstallBanner: Usuario rechazó instalar la PWA');
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ PWAInstallBanner: Error durante la instalación:', error);
        // Si falla la instalación automática, mostrar instrucciones manuales
        setShowManualInstall(true);
      }
    } else if (showManualInstall) {
      // Mostrar instrucciones manuales
      setShowManualInstall(true);
    }
  };

  const handleDismiss = () => {
    console.log('❌ PWAInstallBanner: Banner descartado por el usuario');
    setShowBanner(false);
    // Guardar en localStorage para no mostrar de nuevo por un tiempo
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const showManualInstructions = () => {
    setShowManualInstall(true);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-6 h-6" />
          <div>
            <h3 className="font-semibold text-sm">
              {showManualInstall ? 'Instalar aplicación manualmente' : 'Instalar aplicación'}
            </h3>
            <p className="text-xs opacity-90">
              {showManualInstall 
                ? 'Instala esta app para acceder más rápido y trabajar sin internet'
                : 'Instala esta app para acceder más rápido y trabajar sin internet'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showManualInstall ? (
            <button
              onClick={showManualInstructions}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1"
            >
              <Info className="w-4 h-4" />
              <span>Ver instrucciones</span>
            </button>
          ) : (
            <button
              onClick={handleInstall}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Instalar</span>
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instrucciones manuales */}
      {showManualInstall && (
        <div className="max-w-4xl mx-auto mt-4 p-4 bg-white/10 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">📱 Instrucciones de instalación:</h4>
          <div className="text-xs space-y-1">
            <p><strong>Chrome/Edge:</strong> Haz clic en el ícono de instalación en la barra de direcciones</p>
            <p><strong>Safari (iOS):</strong> Toca el botón "Compartir" y selecciona "Añadir a pantalla de inicio"</p>
            <p><strong>Firefox:</strong> Haz clic en el ícono de instalación en la barra de direcciones</p>
            <p><strong>Android:</strong> Aparecerá un banner de instalación automáticamente</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstallBanner;
