import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AreaSalon, Mesa } from '@prisma/client';

@Injectable()
export class SalonService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================
  // ÁREAS DE SALÓN
  // ==========================
  async obtenerAreas() {
    return this.prisma.areaSalon.findMany({
      orderBy: { orden: 'asc' },
      include: { mesas: true },
    });
  }

  async crearArea(data: { nombre: string; orden?: number }) {
    return this.prisma.areaSalon.create({
      data,
    });
  }

  async actualizarArea(ids: number, data: { nombre?: string; orden?: number }) {
    const area = await this.prisma.areaSalon.findUnique({ where: { ids } });
    if (!area) throw new NotFoundException('Área de salón no encontrada');

    return this.prisma.areaSalon.update({
      where: { ids },
      data,
    });
  }

  async eliminarArea(ids: number) {
    const area = await this.prisma.areaSalon.findUnique({ where: { ids } });
    if (!area) throw new NotFoundException('Área de salón no encontrada');

    return this.prisma.areaSalon.delete({
      where: { ids }
    });
  }

  // ==========================
  // MESAS
  // ==========================
  async obtenerMesas() {
    return this.prisma.mesa.findMany({
      include: { areaSalon: true },
    });
  }

  async obtenerMesasPorArea(areaIds: number) {
    return this.prisma.mesa.findMany({
      where: { areaSalon: { ids: areaIds } },
      include: { areaSalon: true },
    });
  }

  async crearMesa(data: { areaSalonId: string; numeroMesa: string; capacidad?: number; posX?: number; posY?: number }) {
    return this.prisma.mesa.create({
      data: {
        areaSalonId: data.areaSalonId,
        numeroMesa: data.numeroMesa,
        capacidad: data.capacidad ?? 4,
        posX: data.posX ?? 0,
        posY: data.posY ?? 0,
      }
    });
  }

  async actualizarMesa(ids: number, data: { numeroMesa?: string; capacidad?: number; estado?: any; posX?: number; posY?: number }) {
    const mesa = await this.prisma.mesa.findUnique({ where: { ids } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    return this.prisma.mesa.update({
      where: { ids },
      data,
    });
  }

  async eliminarMesa(ids: number) {
    const mesa = await this.prisma.mesa.findUnique({ where: { ids } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    return this.prisma.mesa.delete({
      where: { ids }
    });
  }
}
