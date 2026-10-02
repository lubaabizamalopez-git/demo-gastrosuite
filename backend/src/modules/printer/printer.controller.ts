import { Controller, Post, Body } from '@nestjs/common';
import { PrinterService } from './printer.service';

@Controller('api/printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @Post('ticket')
  async printTicket(@Body() body: { pedidoId: string; total: number; items: any[] }) {
    return this.printerService.imprimirTicket(body.pedidoId, body.total, body.items);
  }

  @Post('comanda')
  async printComanda(@Body() body: { pedidoId: string; items: any[] }) {
    return this.printerService.imprimirComanda(body.pedidoId, body.items);
  }
}
