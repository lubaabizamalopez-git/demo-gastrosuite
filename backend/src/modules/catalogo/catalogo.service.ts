import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class CatalogoService {
  constructor(private prisma: PrismaService) {}

  async obtenerCategoriasConProductos(incluirInestados = false) {
    return this.prisma.categoria.findMany({
      where: incluirInestados ? {} : { estado: 'A' },
      orderBy: { orden: 'asc' },
      include: {
        productos: {
          where: incluirInestados ? {} : { estado: 'A' },
          orderBy: { orden: 'asc' }
        },
      },
    });
  }

  // --- CATEGORÍAS ---

  async obtenerSiguienteOrdenCategoria() {
    const result = await this.prisma.categoria.aggregate({
      _max: { orden: true }
    });
    return (result._max.orden || 0) + 1;
  }

  async crearCategoria(dto: CrearCategoriaDto) {
    if (dto.orden === undefined) {
      dto.orden = await this.obtenerSiguienteOrdenCategoria();
      return this.prisma.categoria.create({ data: dto });
    }

    const categoriaConflicto = await this.prisma.categoria.findFirst({
      where: { orden: dto.orden }
    });

    if (categoriaConflicto) {
      const siguienteOrden = await this.obtenerSiguienteOrdenCategoria();
      return this.prisma.$transaction(async (prisma) => {
        // Intercambiar: la que estaba ocupando el lugar pasa al final
        await prisma.categoria.update({
          where: { id: categoriaConflicto.id },
          data: { orden: siguienteOrden }
        });
        return prisma.categoria.create({ data: dto });
      });
    } else {
      return this.prisma.categoria.create({ data: dto });
    }
  }

  async actualizarCategoria(id: string, dto: ActualizarCategoriaDto) {
    return this.prisma.$transaction(async (prisma) => {
      if (dto.orden !== undefined) {
        const categoriaActual = await prisma.categoria.findUnique({ where: { id } });
        if (categoriaActual && categoriaActual.orden !== dto.orden) {
          const categoriaConflicto = await prisma.categoria.findFirst({
            where: { orden: dto.orden, id: { not: id } }
          });
          
          if (categoriaConflicto) {
            // Mover la actual a un temporal negativo para evitar conflictos UNIQUE
            await prisma.categoria.update({
              where: { id: categoriaActual.id },
              data: { orden: -1 }
            });
            // Mover la conflicto al lugar que dejó la actual
            await prisma.categoria.update({
              where: { id: categoriaConflicto.id },
              data: { orden: categoriaActual.orden }
            });
          }
        }
      }

      const categoria = await prisma.categoria.update({
        where: { id },
        data: dto,
      });

      // Si el estado estado cambia, actualizar en cascada los productos asociados
      if (dto.estado !== undefined) {
        await prisma.producto.updateMany({
          where: { categoriaId: id },
          data: { estado: dto.estado },
        });
      }

      return categoria;
    });
  }

  async eliminarCategoria(id: string) {
    // Soft delete (marcar como inestado) en cascada
    await this.prisma.producto.updateMany({
      where: { categoriaId: id },
      data: { estado: 'I' },
    });

    return this.prisma.categoria.update({
      where: { id },
      data: { estado: 'I' },
    });
  }

  // --- PRODUCTOS ---

  async obtenerSiguienteOrdenProducto(categoriaId: string) {
    const result = await this.prisma.producto.aggregate({
      where: { categoriaId },
      _max: { orden: true }
    });
    return (result._max.orden || 0) + 1;
  }

  async crearProducto(dto: CrearProductoDto) {
    if (dto.orden === undefined) {
      dto.orden = await this.obtenerSiguienteOrdenProducto(dto.categoriaId);
      return this.prisma.producto.create({ data: dto });
    }

    const productoConflicto = await this.prisma.producto.findFirst({
      where: { orden: dto.orden, categoriaId: dto.categoriaId }
    });

    if (productoConflicto) {
      const siguienteOrden = await this.obtenerSiguienteOrdenProducto(dto.categoriaId);
      return this.prisma.$transaction(async (prisma) => {
        // Intercambiar: la que estaba ocupando el lugar pasa al final
        await prisma.producto.update({
          where: { id: productoConflicto.id },
          data: { orden: siguienteOrden }
        });
        return prisma.producto.create({ data: dto });
      });
    } else {
      return this.prisma.producto.create({ data: dto });
    }
  }

  async actualizarProducto(id: string, dto: ActualizarProductoDto) {
    return this.prisma.$transaction(async (prisma) => {
      if (dto.orden !== undefined) {
        const productoActual = await prisma.producto.findUnique({ where: { id } });
        if (productoActual && productoActual.orden !== dto.orden) {
          // Nota: Asumimos que no cambia de categoría, si cambiara la lógica sería más compleja
          const categoriaId = dto.categoriaId || productoActual.categoriaId;
          const productoConflicto = await prisma.producto.findFirst({
            where: { orden: dto.orden, categoriaId: categoriaId, id: { not: id } }
          });
          
          if (productoConflicto) {
            await prisma.producto.update({
              where: { id: productoActual.id },
              data: { orden: -1 }
            });
            await prisma.producto.update({
              where: { id: productoConflicto.id },
              data: { orden: productoActual.orden }
            });
          }
        }
      }

      return prisma.producto.update({
        where: { id },
        data: dto,
      });
    });
  }

  async eliminarProducto(id: string) {
    // Soft delete
    return this.prisma.producto.update({
      where: { id },
      data: { estado: 'I' },
    });
  }
}
