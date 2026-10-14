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

    if (data.rut && data.rut.trim() !== '') {
      const existeRut = await this.prisma.usuario.findFirst({
        where: { rut: data.rut }
      });
      if (existeRut) {
        throw new BadRequestException('El RUT / Documento ya está registrado');
      }
    }

    let passwordPlain = '1234'; // Fallback
    let defaultPin = '1234';
    if (data.rut && data.rut.length >= 4) {
      passwordPlain = data.rut;
      defaultPin = data.rut.substring(0, 4);
    }
    
    if (!data.codigoPin || data.codigoPin.trim() === '') {
      data.codigoPin = defaultPin;
    }

    const existePin = await this.prisma.usuario.findFirst({
      where: { codigoPin: data.codigoPin }
    });
    if (existePin) {
      throw new BadRequestException('El PIN de acceso ya está registrado por otro usuario');
    }

    if ((data as any).clave && (data as any).clave.trim() !== '') {
      passwordPlain = (data as any).clave;
    }

    const salt = await bcrypt.genSalt(10);
    const claveHash = await bcrypt.hash(passwordPlain, salt);

    const { roles, clave, ...userData } = data as any;
    
    let rolIds: string[] = [];
    if (roles && roles.length > 0) {
      const dbRoles = await this.prisma.rol.findMany({
        where: { nombre: { in: roles } }
      });
      rolIds = dbRoles.map(r => r.id);
    }

    return this.prisma.usuario.create({
      data: {
        ...userData,
        creadoEn: new Date(),
        claveHash,
        rolesUsuario: rolIds.length > 0 ? {
          create: rolIds.map(rolId => ({ rolId }))
        } : undefined
      },
      include: {
        rolesUsuario: { include: { rol: true } }
      }
    });
  }

  async update(id: string, data: UpdateUsuarioDto) {
    const { roles, clave, ...userData } = data as any;
    
    if (data.correo && data.correo.trim() !== '') {
      const existeCorreo = await this.prisma.usuario.findFirst({
        where: { correo: data.correo, id: { not: id } }
      });
      if (existeCorreo) {
        throw new BadRequestException('El correo ya está registrado por otro usuario');
      }
    }

    if (data.rut && data.rut.trim() !== '') {
      const existeRut = await this.prisma.usuario.findFirst({
        where: { rut: data.rut, id: { not: id } }
      });
      if (existeRut) {
        throw new BadRequestException('El RUT / Documento ya está registrado por otro usuario');
      }
    }

    if (data.codigoPin && data.codigoPin.trim() !== '') {
      const existePin = await this.prisma.usuario.findFirst({
        where: { codigoPin: data.codigoPin, id: { not: id } }
      });
      if (existePin) {
        throw new BadRequestException('El PIN de acceso ya está registrado por otro usuario');
      }
    }
    
    let updateData: any = { ...userData };
    
    if (clave) {
      const salt = await bcrypt.genSalt(10);
      updateData.claveHash = await bcrypt.hash(clave, salt);
    }
    
    // Si se envían roles, actualizar la tabla intermedia
    if (roles) {
      let rolIds: string[] = [];
      if (roles.length > 0) {
        const dbRoles = await this.prisma.rol.findMany({
          where: { nombre: { in: roles } }
        });
        rolIds = dbRoles.map(r => r.id);
      }
      
      // Eliminar roles actuales y crear los nuevos
      await this.prisma.usuarioRol.deleteMany({
        where: { usuarioId: id }
      });

      return this.prisma.usuario.update({
        where: { id },
        data: {
          ...updateData,
          rolesUsuario: {
            create: rolIds.map(rolId => ({ rolId }))
          }
        },
        include: {
          rolesUsuario: { include: { rol: true } }
        }
      });
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
      include: {
        rolesUsuario: { include: { rol: true } }
      }
    });
  }

  async toggleEstado(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    const nuevoEstado = usuario.estado === 'A' ? 'I' : 'A';
    
    return this.prisma.usuario.update({
      where: { id },
      data: { estado: nuevoEstado },
      include: {
        rolesUsuario: { include: { rol: true } }
      }
    });
  }

  async remove(id: string) {
    // Delete roles first to avoid foreign key issues
    await this.prisma.usuarioRol.deleteMany({
      where: { usuarioId: id }
    });
    return this.prisma.usuario.delete({
      where: { id }
    });
  }
}
