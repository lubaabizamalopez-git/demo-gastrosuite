import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class CatalogoService {
  constructor(private prisma: PrismaService) {}

  async obtenerCategoriasConProductos(incluirInactivos = false) {
    return this.prisma.categoria.findMany({
      where: incluirInactivos ? {} : { activo: 'A' },
      orderBy: { orden: 'asc' },
      include: {
        productos: {
          where: incluirInactivos ? {} : { activo: 'A' },
          orderBy: { orden: 'asc' }
        },
      },
    });
  }

  // --- CATEGORÍAS ---

  async crearCategoria(dto: CrearCategoriaDto) {
    return this.prisma.categoria.create({
      data: dto,
    });
  }

  async actualizarCategoria(id: string, dto: ActualizarCategoriaDto) {
    if (dto.orden !== undefined) {
      const categoriaActual = await this.prisma.categoria.findUnique({ where: { id } });
      if (categoriaActual && categoriaActual.orden !== dto.orden) {
        const categoriaConflicto = await this.prisma.categoria.findFirst({
          where: { orden: dto.orden, id: { not: id } }
        });
        
        if (categoriaConflicto) {
          await this.prisma.categoria.update({
            where: { id: categoriaConflicto.id },
            data: { orden: categoriaActual.orden }
          });
        }
      }
    }

    const categoria = await this.prisma.categoria.update({
      where: { id },
      data: dto,
    });

    // Si el estado activo cambia, actualizar en cascada los productos asociados
    if (dto.activo !== undefined) {
      await this.prisma.producto.updateMany({
        where: { categoriaId: id },
        data: { activo: dto.activo },
      });
    }

    return categoria;
  }

  async eliminarCategoria(id: string) {
    // Soft delete (marcar como inactivo) en cascada
    await this.prisma.producto.updateMany({
      where: { categoriaId: id },
      data: { activo: 'I' },
    });

    return this.prisma.categoria.update({
      where: { id },
      data: { activo: 'I' },
    });
  }

  // --- PRODUCTOS ---

  async crearProducto(dto: CrearProductoDto) {
    return this.prisma.producto.create({
      data: dto,
    });
  }

  async actualizarProducto(id: string, dto: ActualizarProductoDto) {
    if (dto.orden !== undefined) {
      const productoActual = await this.prisma.producto.findUnique({ where: { id } });
      if (productoActual && productoActual.orden !== dto.orden) {
        const productoConflicto = await this.prisma.producto.findFirst({
          where: { orden: dto.orden, categoriaId: productoActual.categoriaId, id: { not: id } }
        });
        
        if (productoConflicto) {
          await this.prisma.producto.update({
            where: { id: productoConflicto.id },
            data: { orden: productoActual.orden }
          });
        }
      }
    }

    return this.prisma.producto.update({
      where: { id },
      data: dto,
    });
  }

  async eliminarProducto(id: string) {
    // Soft delete
    return this.prisma.producto.update({
      where: { id },
      data: { activo: 'I' },
    });
  }
}
