import { Controller, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { KdsService } from './kds.service';
import { EstadoItemPedido, EstadoPedido } from '@prisma/client';

@Controller(['api/kds', 'api/v1/kds', 'kds'])
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  // Permite al cocinero marcar un plato específico (ej: 1 hamburguesa) como PREPARANDO o LISTO
  @Put('items/:ids/estado')
  async updateItemStatus(
    @Param('ids', ParseIntPipe) ids: number, 
    @Body('estado') estado: EstadoItemPedido
  ) {
    return this.kdsService.updateItemStatus(ids, estado);
  }

  // Permite al despachador marcar todo el ticket/pedido como LISTO para entregar
  @Put('pedidos/:id/estado')
  async updateOrderStatus(
    @Param('id') id: string, 
    @Body('estado') estado: EstadoPedido
  ) {
    return this.kdsService.updateOrderStatus(id, estado);
  }
}
