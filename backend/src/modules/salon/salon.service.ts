import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { EstadoMesa } from '@prisma/client';

@Injectable()
export class SalonService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async obtenerTodasLasMesas() {
    return this.prisma.mesa.findMany({
      orderBy: { numeroMesa: 'asc' },
      include: {
        pedidos: {
          where: { estado: { in: ['PENDIENTE', 'EN_COCINA', 'LISTO'] } },
          select: { id: true, total: true, estado: true }
        }
      }
    });
  }

  async actualizarEstadoMesa(id: string, estado: EstadoMesa) {
    const mesaActualizada = await this.prisma.mesa.update({
      where: { id },
      data: { estado }
    });

    // Avisar en tiempo real a todas las tablets de los meseros y la recepción
    this.eventsGateway.server.emit('actualizacion-salon', { tipo: 'MESA_UPDATED', data: mesaActualizada });
    return mesaActualizada;
  }
}
