/**
 * Servicio AFIP compatible con el browser
 * Este archivo reemplaza temporalmente las funcionalidades de AFIP
 * para evitar problemas de compatibilidad con el browser
 */

interface AFIPConfig {
  cuit: string;
  environment: 'testing' | 'production';
}

interface ComprobanteRequest {
  tipoComprobante: number;
  puntoVenta: number;
  concepto: number;
  tipoDocumento: number;
  numeroDocumento: string;
  importeTotal: number;
  importeNeto: number;
  importeIVA: number;
  fechaComprobante: string;
  fechaVencimiento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

interface ComprobanteResponse {
  numero: number;
  cae: string;
  fechaVencimiento: string;
  resultado: string;
  errores?: string[];
}

export class AFIPBrowserService {
  private config: AFIPConfig;

  constructor(config: AFIPConfig) {
    this.config = config;
  }

  async generarComprobante(request: ComprobanteRequest): Promise<ComprobanteResponse> {
    try {
      // En un entorno real, esto debería hacer una llamada a tu backend
      // que luego se comunique con AFIP usando las librerías de Node.js
      
      console.warn('⚠️ [AFIP Browser Service] Usando servicio mock para desarrollo');
      console.log('📄 Datos del comprobante:', request);

      // Simular respuesta de AFIP
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay

      return {
        numero: Math.floor(Math.random() * 1000000) + 1,
        cae: `${Math.floor(Math.random() * 90000000000000) + 10000000000000}`,
        fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        resultado: 'A', // A = Aprobado
        errores: []
      };
    } catch (error) {
      console.error('❌ [AFIP Browser Service] Error:', error);
      throw new Error('Error en la comunicación con AFIP');
    }
  }

  async verificarEstado(): Promise<{ estado: string; mensaje: string }> {
    try {
      console.warn('⚠️ [AFIP Browser Service] Verificando estado mock');
      
      // Simular verificación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        estado: 'OK',
        mensaje: 'Servicio AFIP disponible (mock)'
      };
    } catch (error) {
      console.error('❌ [AFIP Browser Service] Error verificando estado:', error);
      return {
        estado: 'ERROR',
        mensaje: 'Error verificando estado de AFIP'
      };
    }
  }

  async obtenerUltimoComprobante(tipoComprobante: number, puntoVenta: number): Promise<number> {
    try {
      console.warn('⚠️ [AFIP Browser Service] Obteniendo último comprobante mock');
      
      // Simular obtención
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return Math.floor(Math.random() * 1000) + 1;
    } catch (error) {
      console.error('❌ [AFIP Browser Service] Error obteniendo último comprobante:', error);
      throw new Error('Error obteniendo último comprobante de AFIP');
    }
  }
}

// Instancia singleton
let afipServiceInstance: AFIPBrowserService | null = null;

export function getAFIPService(): AFIPBrowserService {
  if (!afipServiceInstance) {
    afipServiceInstance = new AFIPBrowserService({
      cuit: '20111111111', // CUIT de prueba
      environment: 'testing'
    });
  }
  return afipServiceInstance;
}

// Nota importante para desarrollo:
// Este es un servicio mock para desarrollo en el browser.
// En producción, deberías:
// 1. Crear endpoints en tu backend que manejen la comunicación con AFIP
// 2. Usar fetch() desde el frontend para llamar a esos endpoints
// 3. El backend usaría las librerías reales de AFIP (soap, xml2js, etc.)
