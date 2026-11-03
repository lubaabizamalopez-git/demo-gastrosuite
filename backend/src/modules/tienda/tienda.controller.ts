import { All, BadRequestException, Body, Controller, Get, Headers, Param, Post, Req, Res, ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { TiendaService } from './tienda.service';
import { CrearPedidoTiendaRequest } from './dto/crear-pedido-tienda.request';

/**
 * Endpoints PÚBLICOS de la tienda online (cliente final).
 * Nunca exponer aquí operaciones de gestión.
 */
@Controller(['api/v1/tienda', 'api/tienda'])
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  @Get('comunas')
  async obtenerComunas() {
    return this.tiendaService.obtenerComunas();
  }

  /** Retorno desde Webpay (Transbank puede volver por GET o POST) */
  @All('webpay/retorno')
  async retornoWebpay(@Req() req: Request, @Res() res: Response) {
    const parametros = { ...(req.query as Record<string, string>), ...(req.body ?? {}) };
    const ruta = await this.tiendaService.procesarRetornoWebpay(parametros);
    return res.redirect(303, `${process.env.TIENDA_URL ?? ''}${ruta}`);
  }

  @Get(':slug')
  async obtenerEmpresa(@Param('slug') slug: string) {
    return this.tiendaService.obtenerInformacionPublica(slug);
  }

  @Get(':slug/menu')
  async obtenerMenu(@Param('slug') slug: string) {
    return this.tiendaService.obtenerMenu(slug);
  }

  @Post(':slug/pedidos')
  async crearPedido(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CrearPedidoTiendaRequest,
  ) {
    return this.tiendaService.crearPedido(slug, dto);
  }

  @Get(':slug/pedidos/:codigo')
  async obtenerSeguimiento(@Param('slug') slug: string, @Param('codigo') codigo: string) {
    return this.tiendaService.obtenerSeguimiento(slug, codigo);
  }

  @Post(':slug/pedidos/:codigo/pagar')
  async pagarPedido(
    @Param('slug') slug: string,
    @Param('codigo') codigo: string,
    @Headers('origin') origen?: string,
  ) {
    const base = this.validarOrigen(process.env.TIENDA_URL || origen);
    return this.tiendaService.iniciarPago(slug, codigo, `${base}/api/v1/tienda/webpay/retorno`);
  }

  /** La URL de retorno a Webpay se arma con el dominio de la tienda (que hace proxy de /api) */
  private validarOrigen(origen?: string): string {
    try {
      const url = new URL(origen ?? '');
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.origin;
      }
    } catch {
      // se responde abajo
    }
    throw new BadRequestException('No se pudo determinar el origen de la tienda');
  }
}
