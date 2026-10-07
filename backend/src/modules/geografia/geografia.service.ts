import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GeografiaService {
  constructor(private readonly prisma: PrismaService) {}

  async getRegiones() {
    return this.prisma.region.findMany({
      orderBy: { descripcion: 'asc' },
    });
  }

  async getCiudadesPorRegion(regionId: number) {
    return this.prisma.ciudad.findMany({
      where: { id_region: regionId },
      orderBy: { descripcion: 'asc' },
    });
  }

  async getComunasPorCiudad(ciudadId: number) {
    return this.prisma.comuna.findMany({
      where: { id_ciudad: ciudadId },
      orderBy: { descripcion: 'asc' },
    });
  }
}
