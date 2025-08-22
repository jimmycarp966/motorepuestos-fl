import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, Info } from 'lucide-react';
import { Button } from './ui/button';

export const ManualInstallButton: React.FC = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Verificar si ya está instalada
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkIfInstalled();

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Escuchar si ya fue instalada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallModal(false);
    };

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
        // Mostrar el prompt de instalación
        deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('✅ Usuario aceptó instalar la PWA');
          setIsInstalled(true);
        } else {
          console.log('❌ Usuario rechazó instalar la PWA');
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ Error durante la instalación:', error);
      }
    } else {
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
      {/* Botón flotante de instalación */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleInstall}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 px-4 py-3 rounded-full"
          size="lg"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Instalar App</span>
          <span className="sm:hidden">Instalar</span>
        </Button>
      </div>

      {/* Modal de instrucciones manuales */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-bg-secondary border border-dark-border rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-text-primary flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary-500" />
                Instalar Aplicación
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallModal(false)}
                className="text-dark-text-secondary hover:text-dark-text-primary"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-dark-text-secondary">
                Instala esta aplicación para acceder más rápido y trabajar sin internet.
              </p>

              <div className="space-y-3">
                <div className="bg-dark-bg-tertiary p-3 rounded-lg">
                  <h4 className="font-medium text-dark-text-primary mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    Chrome / Edge
                  </h4>
                  <p className="text-xs text-dark-text-secondary">
                    Haz clic en el ícono de instalación en la barra de direcciones
                  </p>
                </div>

                <div className="bg-dark-bg-tertiary p-3 rounded-lg">
                  <h4 className="font-medium text-dark-text-primary mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    Firefox
                  </h4>
                  <p className="text-xs text-dark-text-secondary">
                    Haz clic en el ícono de instalación en la barra de direcciones
                  </p>
                </div>

                <div className="bg-dark-bg-tertiary p-3 rounded-lg">
                  <h4 className="font-medium text-dark-text-primary mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    Safari (iOS)
                  </h4>
                  <p className="text-xs text-dark-text-secondary">
                    Toca el botón "Compartir" y selecciona "Añadir a pantalla de inicio"
                  </p>
                </div>

                <div className="bg-dark-bg-tertiary p-3 rounded-lg">
                  <h4 className="font-medium text-dark-text-primary mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    Android
                  </h4>
                  <p className="text-xs text-dark-text-secondary">
                    Aparecerá un banner de instalación automáticamente
                  </p>
                </div>
              </div>

              <div className="bg-primary-500/10 border border-primary-500/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-primary-500 font-medium mb-1">
                      Beneficios de instalar:
                    </p>
                    <ul className="text-xs text-primary-400 space-y-1">
                      <li>• Acceso rápido desde el escritorio</li>
                      <li>• Funciona sin internet</li>
                      <li>• Experiencia como app nativa</li>
                      <li>• Notificaciones push</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
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
