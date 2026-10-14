import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoPedido, EstadoMesa } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PagosService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async registrarPago(data: {
    pedidoId: string;
    turnoId: string;
    monto: number;
    metodoPagoId: string;
    numeroReferencia?: string;
  }) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: data.pedidoId },
      include: { mesa: true }
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.estado === EstadoPedido.PAGADO) {
      throw new BadRequestException('El pedido ya se encuentra pagado');
    }

    // Resolver método de pago
    let metodo = await this.prisma.metodoPago.findFirst({
      where: {
        OR: [
          { id: data.metodoPagoId },
          { codigo: data.metodoPagoId },
          { nombre: data.metodoPagoId }
        ]
      }
    });

    if (!metodo) {
      metodo = await this.prisma.metodoPago.findFirst({ where: { estado: 'A' } });
      if (!metodo) {
        metodo = await this.prisma.metodoPago.create({
          data: { nombre: 'Efectivo', codigo: 'EFECTIVO', estado: 'A' }
        });
      }
    }

    // Resolver turno de caja
    let turnoId = data.turnoId;
    if (!turnoId) {
      const turnoActivo = await this.prisma.turnoCaja.findFirst();
      if (turnoActivo) {
        turnoId = turnoActivo.id;
      } else {
        const nuevoTurno = await this.prisma.turnoCaja.create({
          data: { estado: 'ABIERTO', abiertoEn: new Date() }
        });
        turnoId = nuevoTurno.id;
      }
    }

    // 1. Crear el registro de pago
    const nuevoPago = await this.prisma.pago.create({
      data: {
        pedidoId: data.pedidoId,
        turnoId,
        monto: Number(data.monto),
        metodoPagoId: metodo.id,
        numeroReferencia: data.numeroReferencia || null
      }
    });

    // 2. Cambiar estado del pedido a PAGADO
    const pedidoActualizado = await this.prisma.pedido.update({
      where: { id: data.pedidoId },
      data: { estado: EstadoPedido.PAGADO }
    });

    // 3. Liberar la mesa si es de salón
    let mesaActualizada = null;
    if (pedido.mesaId) {
      mesaActualizada = await this.prisma.mesa.update({
        where: { id: pedido.mesaId },
        data: { estado: EstadoMesa.L } // Pasa a Limpiando
      }).catch(() => null);
      
      if (mesaActualizada) {
        this.eventsGateway.server?.emit('actualizacion-salon', { tipo: 'MESA_UPDATED', data: mesaActualizada });
      }
    }

    return { pago: nuevoPago, pedido: pedidoActualizado, mesa: mesaActualizada };
  }

  async obtenerMetodosPago() {
    return this.prisma.metodoPago.findMany({
      where: { estado: 'A' },
      orderBy: { nombre: 'asc' }
    });
  }
}
