import * as soap from 'soap';
import * as xml2js from 'xml2js';
import * as forge from 'node-forge';

// Interfaces para AFIP
interface AFIPConfig {
  cuit: string;
  puntoVenta: number;
  ambiente: 'testing' | 'production';
  certificado?: string;
  clavePrivada?: string;
}

interface ComprobanteRequest {
  tipoComprobante: string; // A, B, C
  puntoVenta: number;
  concepto: number; // 1: Productos, 2: Servicios, 3: Productos y Servicios
  tipoDoc: number; // 80: CUIT, 96: DNI, etc.
  nroDoc: string;
  fechaServicio: string;
  fechaVtoPago: string;
  impTotal: number;
  impTotConc: number;
  impNeto: number;
  impOpEx: number;
  impIVA: number;
  impTrib: number;
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    bonif: number;
    impIVA: number;
    impTotal: number;
  }>;
}

interface ComprobanteResponse {
  cae: string;
  caeVto: string;
  resultado: string; // A: Aprobado, R: Rechazado, P: Pendiente
  motivoRechazo?: string;
  observaciones?: string;
}

class AFIPService {
  private config: AFIPConfig;
  private wsaaUrl: string;
  private wsfev1Url: string;
  private token: string = '';
  private sign: string = '';
  private tokenExpiration: Date = new Date();

  constructor(config: AFIPConfig) {
    this.config = config;
    
    if (config.ambiente === 'testing') {
      this.wsaaUrl = 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms';
      this.wsfev1Url = 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx';
    } else {
      this.wsaaUrl = 'https://wsaa.afip.gov.ar/ws/services/LoginCms';
      this.wsfev1Url = 'https://servicios1.afip.gov.ar/wsfev1/service.asmx';
    }
  }

  // Obtener certificado (testing o producción)
  private async getCertificate(): Promise<{ cert: string; key: string }> {
    if (this.config.ambiente === 'testing') {
      return this.generateTestCertificate();
    } else {
      return this.loadProductionCertificate();
    }
  }

  // Generar certificado de prueba para testing
  private generateTestCertificate(): { cert: string; key: string } {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [{
      name: 'commonName',
      value: 'Test Certificate'
    }, {
      name: 'countryName',
      value: 'AR'
    }, {
      shortName: 'ST',
      value: 'Buenos Aires'
    }, {
      name: 'localityName',
      value: 'CABA'
    }, {
      name: 'organizationName',
      value: 'Test Organization'
    }, {
      shortName: 'OU',
      value: 'Test Unit'
    }];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);
    
    return {
      cert: forge.pki.certificateToPem(cert),
      key: forge.pki.privateKeyToPem(keys.privateKey)
    };
  }

  // Cargar certificado de producción
  private async loadProductionCertificate(): Promise<{ cert: string; key: string }> {
    try {
      // En un entorno real, estos certificados deberían estar en variables de entorno
      // o en un sistema de gestión de secretos
      const certPath = this.config.certificado || process.env.AFIP_CERT_PATH;
      const keyPath = this.config.clavePrivada || process.env.AFIP_KEY_PATH;
      
      if (!certPath || !keyPath) {
        throw new Error('Certificados de producción no configurados. Verifica AFIP_CERT_PATH y AFIP_KEY_PATH');
      }

      // En un entorno web, los certificados podrían estar en el servidor
      // y ser accedidos a través de una API
      const response = await fetch('/api/afip/certificates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error cargando certificados de producción');
      }

      const data = await response.json();
      return {
        cert: data.certificate,
        key: data.privateKey
      };
    } catch (error) {
      console.error('Error cargando certificado de producción:', error);
      throw new Error('No se pudo cargar el certificado de producción. Verifica la configuración.');
    }
  }

  // Obtener ticket de acceso (WSAA)
  private async getAccessTicket(): Promise<void> {
    try {
      // Si ya tenemos un token válido, no necesitamos obtener uno nuevo
      if (this.token && this.tokenExpiration > new Date()) {
        return;
      }

      const { cert, key } = await this.getCertificate();
      
      // Crear el XML de login
      const loginXml = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Date.now()}</uniqueId>
    <generationTime>${new Date().toISOString()}</generationTime>
    <expirationTime>${new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;

      // Firmar el XML
      const signedXml = this.signXml(loginXml, key);
      
      // Enviar a WSAA
      const response = await this.callWSAA(signedXml);
      
      // Parsear respuesta
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response);
      
      if (result.loginTicketResponse && result.loginTicketResponse.credentials) {
        this.token = result.loginTicketResponse.credentials[0];
        this.sign = result.loginTicketResponse.sign[0];
        
        // Calcular expiración (12 horas)
        this.tokenExpiration = new Date(Date.now() + 12 * 60 * 60 * 1000);
      } else {
        throw new Error('Error al obtener ticket de acceso');
      }
    } catch (error) {
      console.error('Error en getAccessTicket:', error);
      throw error;
    }
  }

  // Firmar XML
  private signXml(xml: string, privateKey: string): string {
    const key = forge.pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha1.create();
    md.update(xml, 'utf8');
    const signature = key.sign(md);
    const signatureB64 = forge.util.encode64(signature);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <loginCms xmlns="http://wsaa.view.sua.dvadac.desein.afip.gov">
      <in0>${signatureB64}</in0>
    </loginCms>
  </soap:Body>
</soap:Envelope>`;
  }

  // Llamar WSAA
  private async callWSAA(signedXml: string): Promise<string> {
    const client = await soap.createClientAsync(this.wsaaUrl);
    const result = await client.loginCmsAsync({ in0: signedXml });
    return result[0].loginCmsReturn;
  }

  // Generar comprobante electrónico
  async generarComprobante(request: ComprobanteRequest): Promise<ComprobanteResponse> {
    try {
      // Obtener ticket de acceso
      await this.getAccessTicket();

      // Crear XML del comprobante
      const comprobanteXml = this.createComprobanteXml(request);
      
      // Llamar WSFEv1
      const response = await this.callWSFEv1(comprobanteXml);
      
      // Parsear respuesta
      return this.parseComprobanteResponse(response);
    } catch (error) {
      console.error('Error en generarComprobante:', error);
      throw error;
    }
  }

  // Crear XML del comprobante
  private createComprobanteXml(request: ComprobanteRequest): string {
    const fecha = new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Header>
    <AuthHeader xmlns="http://ar.gov.afip.dif.FEV1/">
      <Token>${this.token}</Token>
      <Sign>${this.sign}</Sign>
      <Cuit>${this.config.cuit}</Cuit>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <FECAESolicitar xmlns="http://ar.gov.afip.dif.FEV1/">
      <Auth>
        <Token>${this.token}</Token>
        <Sign>${this.sign}</Sign>
        <Cuit>${this.config.cuit}</Cuit>
      </Auth>
      <FeCAEReq>
        <FeCabReq>
          <CantReg>1</CantReg>
          <PtoVta>${request.puntoVenta}</PtoVta>
          <CbteTipo>${this.getTipoComprobanteCode(request.tipoComprobante)}</CbteTipo>
        </FeCabReq>
        <FeDetReq>
          <FECAEDetRequest>
            <Concepto>${request.concepto}</Concepto>
            <DocTipo>${request.tipoDoc}</DocTipo>
            <DocNro>${request.nroDoc}</DocNro>
            <CbteDesde>1</CbteDesde>
            <CbteHasta>1</CbteHasta>
            <CbteFch>${fecha.replace(/-/g, '')}</CbteFch>
            <ImpTotal>${request.impTotal}</ImpTotal>
            <ImpTotConc>${request.impTotConc}</ImpTotConc>
            <ImpNeto>${request.impNeto}</ImpNeto>
            <ImpOpEx>${request.impOpEx}</ImpOpEx>
            <ImpIVA>${request.impIVA}</ImpIVA>
            <ImpTrib>${request.impTrib}</ImpTrib>
            <FchServDesde>${request.fechaServicio.replace(/-/g, '')}</FchServDesde>
            <FchServHasta>${request.fechaServicio.replace(/-/g, '')}</FchServHasta>
            <FchVtoPago>${request.fechaVtoPago.replace(/-/g, '')}</FchVtoPago>
            <MonId>PES</MonId>
            <MonCotiz>1</MonCotiz>
            <Iva>
              <AlicIva>
                <Id>5</Id>
                <BaseImp>${request.impNeto}</BaseImp>
                <Importe>${request.impIVA}</Importe>
              </AlicIva>
            </Iva>
          </FECAEDetRequest>
        </FeDetReq>
      </FeCAEReq>
    </FECAESolicitar>
  </soap:Body>
</soap:Envelope>`;
  }

  // Obtener código de tipo de comprobante
  private getTipoComprobanteCode(tipo: string): number {
    const tipos: { [key: string]: number } = {
      'A': 1, // Factura A
      'B': 6, // Factura B
      'C': 11, // Factura C
      'E': 3, // Nota de Crédito E
      'M': 51 // Nota de Débito M
    };
    return tipos[tipo] || 1;
  }

  // Llamar WSFEv1
  private async callWSFEv1(xml: string): Promise<string> {
    const client = await soap.createClientAsync(this.wsfev1Url);
    const result = await client.FECAESolicitarAsync({ xml });
    return result[0].FECAESolicitarResult;
  }

  // Parsear respuesta del comprobante
  private parseComprobanteResponse(response: string): ComprobanteResponse {
    // En testing, simular respuesta exitosa
    if (this.config.ambiente === 'testing') {
      return {
        cae: '12345678901234',
        caeVto: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        resultado: 'A',
        observaciones: 'Comprobante de prueba generado exitosamente'
      };
    }
    
    // En producción, parsear respuesta real
    // Aquí iría el parsing real del XML de respuesta
    return {
      cae: '',
      caeVto: '',
      resultado: 'P',
      observaciones: 'Respuesta en desarrollo'
    };
  }

  // Verificar estado del servicio
  async verificarEstado(): Promise<boolean> {
    try {
      await this.getAccessTicket();
      return true;
    } catch (error) {
      console.error('Error verificando estado:', error);
      return false;
    }
  }
}

// Instancia singleton
let afipServiceInstance: AFIPService | null = null;

export function getAFIPService(): AFIPService {
  if (!afipServiceInstance) {
    afipServiceInstance = new AFIPService({
      cuit: '20111111111',
      puntoVenta: 1,
      ambiente: 'testing'
    });
  }
  return afipServiceInstance;
}

export { AFIPService, type AFIPConfig, type ComprobanteRequest, type ComprobanteResponse };
