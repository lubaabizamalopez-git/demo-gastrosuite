import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogoService {
  constructor(private prisma: PrismaService) {}

  async obtenerCategoriasConProductos() {
    return this.prisma.categoria.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
      include: {
        productos: {
          where: { activo: true },
        },
      },
    });
  }
}
