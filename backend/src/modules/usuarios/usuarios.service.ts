import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      include: {
        rolesUsuario: {
          include: {
            rol: true
          }
        }
      },
      orderBy: { ids: 'asc' }
    });
  }

  async findRoles() {
    return this.prisma.rol.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async create(data: CreateUsuarioDto) {
    // Verificar si el correo ya existe
    const existeCorreo = await this.prisma.usuario.findUnique({
      where: { correo: data.correo }
    });
    if (existeCorreo) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Regla de negocio: la contraseña por defecto son los primeros 4 dígitos del documento + ****
    let passwordPlain = '1234****'; // Fallback
    if (data.rut && data.rut.length >= 4) {
      passwordPlain = data.rut.substring(0, 4) + '****';
    }

    const salt = await bcrypt.genSalt(10);
    const claveHash = await bcrypt.hash(passwordPlain, salt);

    const { roles, ...userData } = data;

    return this.prisma.usuario.create({
      data: {
        ...userData,
        claveHash,
        rolesUsuario: roles && roles.length > 0 ? {
          create: roles.map(rolId => ({ rolId }))
        } : undefined
      },
      include: {
        rolesUsuario: { include: { rol: true } }
      }
    });
  }

  async update(id: string, data: UpdateUsuarioDto) {
    const { roles, ...userData } = data;
    
    // Si se envían roles, actualizar la tabla intermedia
    if (roles) {
      // Eliminar roles actuales y crear los nuevos
      await this.prisma.usuarioRol.deleteMany({
        where: { usuarioId: id }
      });
      return this.prisma.usuario.update({
        where: { id },
        data: {
          ...userData,
          rolesUsuario: {
            create: roles.map(rolId => ({ rolId }))
          }
        },
        include: {
          rolesUsuario: { include: { rol: true } }
        }
      });
    }

    return this.prisma.usuario.update({
      where: { id },
      data: userData,
      include: {
        rolesUsuario: { include: { rol: true } }
      }
    });
  }

  async toggleEstado(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    const nuevoEstado = usuario.activo === 'A' ? 'I' : 'A';
    
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: nuevoEstado },
      include: {
        rolesUsuario: { include: { rol: true } }
      }
    });
  }
}
