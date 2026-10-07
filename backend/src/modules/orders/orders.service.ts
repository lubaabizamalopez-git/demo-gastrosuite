// Restart watcher
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { EstadoPedido } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async createOrder(data: any) {
    // 1. Crear el pedido en la base de datos
    const newOrder = await this.prisma.pedido.create({
      data: {
        tipoPedido: data.tipoPedido || 'SALON',
        estado: EstadoPedido.PENDIENTE,
        mesaId: data.mesaId || null,
        meseroId: data.meseroId || null,
        subtotal: data.subtotal || 0,
        impuestos: data.impuestos || 0,
        total: data.total || 0,
        items: {
          create: (data.items || []).map((item: any) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            precioTotal: item.precioTotal,
            areaPreparacion: item.areaPreparacion,
            varianteId: item.varianteId || null,
            notas: item.notas || null
          }))
        }
      } as any,
      include: { 
        items: { include: { producto: true } }, 
        mesa: true 
      } as any
    });

    // 2. MAGIA WEBSOCKETS: Emitir el evento de nuevo pedido al KDS
    this.eventsGateway.emitNuevoPedido(newOrder);

    return newOrder;
  }

  async getPendingOrders() {
    return this.prisma.pedido.findMany({
      where: { 
        estado: { in: [EstadoPedido.PENDIENTE, EstadoPedido.EN_COCINA] } 
      },
      include: { 
        items: { include: { producto: true } }, 
        mesa: true 
      } as any,
      orderBy: { creadoEn: 'asc' }
    });
  }

  async getAllOrders() {
    return this.prisma.pedido.findMany({
      include: { 
        items: { include: { producto: true } }, 
        mesa: true 
      } as any,
      orderBy: { creadoEn: 'desc' }
    });
  }
}

