import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, Info, AlertCircle, Monitor } from 'lucide-react';
import { Button } from './ui/button';

export const ManualInstallButton: React.FC = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState({
    hasPrompt: false,
    canInstall: false,
    reason: ''
  });

  useEffect(() => {
    console.log('🔍 ManualInstallButton: Iniciando verificación...');
    
    // Verificar si ya está instalada
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
      console.log('📱 ManualInstallButton: ¿Ya instalada?', isStandalone);
    };

    checkIfInstalled();

    // Verificar si puede instalar
    const checkInstallability = () => {
      const canInstall = 'serviceWorker' in navigator && 
                        'PushManager' in window &&
                        window.matchMedia('(display-mode: browser)').matches;
      
      setDebugInfo(prev => ({ ...prev, canInstall }));
      console.log('🔧 ManualInstallButton: ¿Puede instalar?', canInstall);
    };

    checkInstallability();

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 ManualInstallButton: beforeinstallprompt capturado!');
      e.preventDefault();
      setDeferredPrompt(e);
      setDebugInfo(prev => ({ ...prev, hasPrompt: true, reason: 'Prompt disponible' }));
    };

    // Escuchar si ya fue instalada
    const handleAppInstalled = () => {
      console.log('✅ ManualInstallButton: App instalada!');
      setIsInstalled(true);
      setShowInstallModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar después de un delay
    setTimeout(() => {
      if (!deferredPrompt) {
        console.log('⚠️ ManualInstallButton: No se capturó beforeinstallprompt');
        setDebugInfo(prev => ({ 
          ...prev, 
          reason: 'No se detectó prompt automático - usar instalación manual' 
        }));
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const forceInstall = () => {
    console.log('🚀 ManualInstallButton: Forzando instalación...');
    
    // Intentar múltiples métodos de instalación
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      // Método alternativo: abrir en nueva ventana
      const url = window.location.href;
      const width = 1200;
      const height = 800;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      window.open(url, 'motorepuestos', 
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );
    }
  };

  const handleInstall = async () => {
    console.log('🚀 ManualInstallButton: Intentando instalación...');
    console.log('📊 ManualInstallButton: Estado actual:', { deferredPrompt: !!deferredPrompt, debugInfo });
    
    if (deferredPrompt) {
      try {
        console.log('🎯 ManualInstallButton: Mostrando prompt automático...');
        // Mostrar el prompt de instalación
        deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('✅ ManualInstallButton: Usuario aceptó instalar la PWA');
          setIsInstalled(true);
        } else {
          console.log('❌ ManualInstallButton: Usuario rechazó instalar la PWA');
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ ManualInstallButton: Error durante la instalación:', error);
        setShowInstallModal(true);
      }
    } else {
      console.log('📋 ManualInstallButton: Mostrando instrucciones manuales');
      // Si no hay prompt automático, mostrar instrucciones manuales
      setShowInstallModal(true);
    }
  };

  // No mostrar si ya está instalada
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Botón flotante de instalación - MÁS PROMINENTE */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleInstall}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 px-6 py-4 rounded-full text-lg font-semibold animate-pulse"
          size="lg"
        >
          <Download className="w-6 h-6" />
          <span className="hidden sm:inline">🖥️ Instalar en PC</span>
          <span className="sm:hidden">🖥️ Instalar</span>
        </Button>
      </div>

      {/* Modal de instrucciones manuales */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-bg-secondary border border-dark-border rounded-lg max-w-2xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-dark-text-primary flex items-center gap-2">
                <Monitor className="w-6 h-6 text-primary-500" />
                Instalar en PC - Chrome
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallModal(false)}
                className="text-dark-text-secondary hover:text-dark-text-primary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-dark-text-secondary">
                Instala esta aplicación en tu PC para acceder más rápido y trabajar sin internet.
              </p>

              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-yellow-500 font-medium mb-1">
                        Debug Info:
                      </p>
                      <ul className="text-xs text-yellow-400 space-y-1">
                        <li>• Prompt automático: {debugInfo.hasPrompt ? '✅' : '❌'}</li>
                        <li>• Puede instalar: {debugInfo.canInstall ? '✅' : '❌'}</li>
                        <li>• Razón: {debugInfo.reason}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Método 1: Ícono en barra de direcciones */}
                <div className="bg-dark-bg-tertiary p-4 rounded-lg">
                  <h4 className="font-medium text-dark-text-primary mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    Método 1: Ícono en barra
                  </h4>
                  <p className="text-sm text-dark-text-secondary mb-3">
                    Busca el ícono de instalación en la barra de direcciones:
                  </p>
                  <div className="bg-gray-800 p-3 rounded text-xs font-mono text-gray-300 border border-gray-600">
                    🌐 <span className="text-blue-400">motorepuestos-fl.vercel.app</span> <span className="text-green-400">⬇️</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Haz clic en el ícono ⬇️ para instalar
                  </p>
                </div>

                {/* Método 2: Menú de Chrome */}
                <div className="bg-dark-bg-tertiary p-4 rounded-lg">
                  <h4 className="font-medium text-dark-text-primary mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    Método 2: Menú de Chrome
                  </h4>
                  <p className="text-sm text-dark-text-secondary mb-3">
                    Usa el menú de Chrome:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">1.</span>
                      <span>Haz clic en los 3 puntos ⋮</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">2.</span>
                      <span>Busca "Instalar Motorepuestos"</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">3.</span>
                      <span>Haz clic en "Instalar"</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Método 3: Forzar instalación */}
              <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-lg">
                <h4 className="font-medium text-primary-500 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Método 3: Forzar Instalación
                </h4>
                <p className="text-sm text-primary-400 mb-3">
                  Si los métodos anteriores no funcionan, intenta esto:
                </p>
                <Button
                  onClick={forceInstall}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                >
                  🚀 Forzar Instalación Automática
                </Button>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-500 font-medium mb-2">
                      ✅ Beneficios de instalar en PC:
                    </p>
                    <ul className="text-sm text-green-400 space-y-1">
                      <li>• 🚀 Acceso rápido desde el escritorio</li>
                      <li>• 📱 Funciona sin internet</li>
                      <li>• 🎯 Experiencia como app nativa</li>
                      <li>• 🔔 Notificaciones push</li>
                      <li>• 💻 Ventana independiente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowInstallModal(false)}
                className="flex-1"
              >
                Cerrar
              </Button>
              <Button
                onClick={handleInstall}
                className="flex-1 bg-primary-500 hover:bg-primary-600"
              >
                Intentar Instalación Automática
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualInstallButton;
