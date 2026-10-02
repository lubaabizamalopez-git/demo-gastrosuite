import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { EstadoItemPedido, EstadoPedido } from '@prisma/client';

@Injectable()
export class KdsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async updateItemStatus(ids: number, estado: EstadoItemPedido) {
    const updatedItem = await this.prisma.itemPedido.update({
      where: { ids },
      data: { estado }
    });

    // Emitimos la actualización para que las pantallas se sincronicen al instante
    this.eventsGateway.emitActualizacionKds({ tipo: 'ITEM_UPDATED', data: updatedItem });
    return updatedItem;
  }

  async updateOrderStatus(id: string, estado: EstadoPedido) {
    const updatedOrder = await this.prisma.pedido.update({
      where: { id },
      data: { estado }
    });

    // Emitimos la actualización para notificar al KDS y al TPV/Mesero que el pedido está listo
    this.eventsGateway.emitActualizacionKds({ tipo: 'ORDER_UPDATED', data: updatedOrder });
    return updatedOrder;
  }
}
