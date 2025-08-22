import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Verificar si ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    if (isInstalled) {
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Escuchar si ya fue instalada
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('Usuario aceptó instalar la PWA');
        setShowBanner(false);
      } else {
        console.log('Usuario rechazó instalar la PWA');
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error durante la instalación:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Guardar en localStorage para no mostrar de nuevo por un tiempo
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Verificar si el banner fue descartado recientemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 horas

      if (now - dismissedTime < oneDay) {
        setShowBanner(false);
      } else {
        localStorage.removeItem('pwa-banner-dismissed');
      }
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-6 h-6" />
          <div>
            <h3 className="font-semibold text-sm">Instalar aplicación</h3>
            <p className="text-xs opacity-90">
              Instala esta app para acceder más rápido y trabajar sin internet
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Instalar</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
