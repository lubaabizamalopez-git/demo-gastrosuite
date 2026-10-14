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

  // ==========================
  // ÁREAS DE SALÓN
  // ==========================
  async obtenerTodasLasAreas() {
    return this.prisma.areaSalon.findMany({
      orderBy: { orden: 'asc' }
    });
  }

  async crearArea(data: { nombre: string; orden?: number }) {
    let orden = data.orden;
    if (orden === undefined) {
      const total = await this.prisma.areaSalon.count();
      orden = total + 1;
    }

    return this.prisma.areaSalon.create({
      data: {
        nombre: data.nombre,
        orden
      }
    });
  }

  async actualizarArea(ids: number, data: { nombre?: string; orden?: number }) {
    const area = await this.prisma.areaSalon.findUnique({ where: { ids } });
    if (!area) throw new NotFoundException('Área no encontrada');

    return this.prisma.areaSalon.update({
      where: { ids },
      data
    });
  }

  async eliminarArea(ids: number) {
    const area = await this.prisma.areaSalon.findUnique({ where: { ids } });
    if (!area) throw new NotFoundException('Área no encontrada');

    // Eliminar o desasociar mesas pertenecientes a esta área
    await this.prisma.mesa.deleteMany({
      where: { areaSalonId: area.id }
    });

    return this.prisma.areaSalon.delete({
      where: { ids }
    });
  }

  // ==========================
  // MESAS
  // ==========================
  async obtenerTodasLasMesas() {
    const mesas = await this.prisma.mesa.findMany({
      orderBy: { numeroMesa: 'asc' },
      include: {
        pedidos: {
          where: { estado: { in: ['PENDIENTE', 'EN_COCINA', 'LISTO'] } },
          select: { id: true, total: true, estado: true }
        }
      }
    });

    // Añadir datos de su área correspondiente y monto
    const areas = await this.prisma.areaSalon.findMany();
    const areaMap = new Map(areas.map(a => [a.id, a]));

    return mesas.map(m => {
      const monto = m.pedidos?.reduce((acc: number, p: any) => acc + (Number(p.total) || 0), 0) || 0;
      return {
        ...m,
        monto,
        areaSalon: areaMap.get(m.areaSalonId) || null
      };
    });
  }

  async obtenerMesasPorArea(areaIds: number) {
    const area = await this.prisma.areaSalon.findUnique({ where: { ids: areaIds } });
    if (!area) return [];

    const mesas = await this.prisma.mesa.findMany({
      where: { areaSalonId: area.id },
      orderBy: { numeroMesa: 'asc' },
      include: {
        pedidos: {
          where: { estado: { in: ['PENDIENTE', 'EN_COCINA', 'LISTO'] } },
          select: { id: true, total: true, estado: true }
        }
      }
    });

    return mesas.map(m => {
      const monto = m.pedidos?.reduce((acc: number, p: any) => acc + (Number(p.total) || 0), 0) || 0;
      return {
        ...m,
        monto,
        areaSalon: area
      };
    });
  }

  async crearMesa(data: {
    areaSalonId: string;
    numeroMesa: string;
    capacidad?: number;
    posX?: number;
    posY?: number;
    estado?: EstadoMesa;
    shape?: string;
  }) {
    const nuevaMesa = await this.prisma.mesa.create({
      data: {
        areaSalonId: data.areaSalonId,
        numeroMesa: data.numeroMesa,
        capacidad: data.capacidad ?? 4,
        posX: data.posX ?? 0,
        posY: data.posY ?? 0,
        estado: data.estado ?? 'D',
        shape: data.shape ?? 'redonda'
      }
    });

    const area = await this.prisma.areaSalon.findUnique({ where: { id: data.areaSalonId } });
    const mesaConArea = { ...nuevaMesa, areaSalon: area };

    this.eventsGateway.server?.emit('actualizacion-salon', { tipo: 'MESA_CREATED', data: mesaConArea });
    return mesaConArea;
  }

  async actualizarMesa(ids: number, data: Partial<{
    areaSalonId: string;
    numeroMesa: string;
    capacidad: number;
    posX: number;
    posY: number;
    estado: EstadoMesa;
    shape: string;
  }>) {
    const mesa = await this.prisma.mesa.findUnique({ where: { ids } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    const mesaActualizada = await this.prisma.mesa.update({
      where: { ids },
      data
    });

    const area = await this.prisma.areaSalon.findUnique({ where: { id: mesaActualizada.areaSalonId } });
    const mesaConArea = { ...mesaActualizada, areaSalon: area };

    this.eventsGateway.server?.emit('actualizacion-salon', { tipo: 'MESA_UPDATED', data: mesaConArea });
    return mesaConArea;
  }

  async actualizarEstadoMesa(id: string, estado: EstadoMesa) {
    // Si viene como número (ids) o como uuid (id)
    const isIds = !isNaN(Number(id));
    const mesa = isIds
      ? await this.prisma.mesa.findUnique({ where: { ids: Number(id) } })
      : await this.prisma.mesa.findUnique({ where: { id } });

    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    const mesaActualizada = await this.prisma.mesa.update({
      where: { id: mesa.id },
      data: { estado }
    });

    this.eventsGateway.server?.emit('actualizacion-salon', { tipo: 'MESA_UPDATED', data: mesaActualizada });
    return mesaActualizada;
  }

  async eliminarMesa(ids: number) {
    const mesa = await this.prisma.mesa.findUnique({ where: { ids } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    await this.prisma.mesa.delete({ where: { ids } });
    this.eventsGateway.server?.emit('actualizacion-salon', { tipo: 'MESA_DELETED', data: { ids, id: mesa.id } });
    return { ok: true, mensaje: 'Mesa eliminada' };
  }
}
