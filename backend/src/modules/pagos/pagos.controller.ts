import { Controller, Post, Body, Get } from '@nestjs/common';
import { PagosService } from './pagos.service';

@Controller(['api/pagos', 'api/v1/pagos', 'pagos'])
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get('metodos')
  async getMetodosPago() {
    return this.pagosService.obtenerMetodosPago();
  }

  @Post()
  async registrarPago(@Body() data: {
    pedidoId: string;
    turnoId: string;
    monto: number;
    metodoPagoId: string;
    numeroReferencia?: string;
  }) {
    return this.pagosService.registrarPago(data);
  }
}
