import { Injectable, Logger } from '@nestjs/common';
import { IntegrationApiKeys, IntegrationCommerceCodes, WebpayPlus } from 'transbank-sdk';

/**
 * Envoltorio de Webpay Plus (Transbank).
 * Sin credenciales en el entorno usa el ambiente de integración (pruebas) de Transbank.
 * Variables: WEBPAY_ENTORNO=PRODUCCION, WEBPAY_CODIGO_COMERCIO, WEBPAY_API_KEY.
 */
@Injectable()
export class WebpayService {
  private logger = new Logger('WebpayService');
  private transaccion: InstanceType<typeof WebpayPlus.Transaction>;

  constructor() {
    const { WEBPAY_ENTORNO, WEBPAY_CODIGO_COMERCIO, WEBPAY_API_KEY } = process.env;

    if (WEBPAY_ENTORNO === 'PRODUCCION' && WEBPAY_CODIGO_COMERCIO && WEBPAY_API_KEY) {
      this.transaccion = WebpayPlus.Transaction.buildForProduction(WEBPAY_CODIGO_COMERCIO, WEBPAY_API_KEY);
      this.logger.log('Webpay Plus en ambiente de PRODUCCIÓN');
    } else {
      this.transaccion = WebpayPlus.Transaction.buildForIntegration(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
      );
      this.logger.log('Webpay Plus en ambiente de INTEGRACIÓN (pruebas)');
    }
  }

  async crearTransaccion(ordenCompra: string, sesionId: string, monto: number, urlRetorno: string): Promise<{ token: string; url: string }> {
    return this.transaccion.create(ordenCompra, sesionId, monto, urlRetorno);
  }

  async confirmarTransaccion(token: string): Promise<any> {
    return this.transaccion.commit(token);
  }

  async consultarTransaccion(token: string): Promise<any> {
    return this.transaccion.status(token);
  }
}
