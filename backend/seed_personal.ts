import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
dotenv.config();

const dbUrlStr = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/gastrosuite';
const adapter = new PrismaMariaDb(dbUrlStr);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando actualización de BD y seed de personal...');

  // 1. Agregar columna imagenUrl si no existe
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE usuarios ADD COLUMN imagenUrl VARCHAR(255) DEFAULT 'NULL';`);
    console.log("Columna imagenUrl agregada a usuarios.");
  } catch(e: any) {
    console.log("La columna imagenUrl ya existe o hubo un error menor (se ignora).");
  }

  // 2. Asegurar roles
  const rolesNecesarios = ['SUPERADMIN', 'CAJERO', 'MESERO'];
  for (const nombreRol of rolesNecesarios) {
    const existe = await prisma.rol.findUnique({ where: { nombre: nombreRol } });
    if (!existe) {
      await prisma.rol.create({ data: { nombre: nombreRol, descripcion: `Rol de ${nombreRol}` } });
    }
  }

  const rolMesero = await prisma.rol.findUnique({ where: { nombre: 'MESERO' } });
  const rolCajero = await prisma.rol.findUnique({ where: { nombre: 'CAJERO' } });
  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: 'SUPERADMIN' } });

  const salt = await bcrypt.genSalt(10);
  const hashDefecto = await bcrypt.hash('1234****', salt);

  const usuariosMock = [
    {
      rut: '11111111-1',
      correo: 'admin@gastrosuite.com',
      nombre: 'Carlos',
      apellidoPaterno: 'Mendoza',
      estado: 'A',
      codigoPin: '1234',
      imagenUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
      rolId: rolAdmin?.id
    },
    {
      rut: '22222222-2',
      correo: 'ana.caja@gastrosuite.com',
      nombre: 'Ana',
      apellidoPaterno: 'Torres',
      estado: 'A',
      codigoPin: '2233',
      imagenUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      rolId: rolCajero?.id
    },
    {
      rut: '33333333-3',
      correo: 'pedro.mesero@gastrosuite.com',
      nombre: 'Pedro',
      apellidoPaterno: 'Silva',
      estado: 'A',
      codigoPin: '3344',
      imagenUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      rolId: rolMesero?.id
    },
    {
      rut: '44444444-4',
      correo: 'laura.mesera@gastrosuite.com',
      nombre: 'Laura',
      apellidoPaterno: 'Gómez',
      estado: 'A',
      codigoPin: '4455',
      imagenUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
      rolId: rolMesero?.id
    },
    {
      rut: '55555555-5',
      correo: 'diego.mesero@gastrosuite.com',
      nombre: 'Diego',
      apellidoPaterno: 'Rojas',
      estado: 'I', // Inactivo para pruebas
      codigoPin: '5566',
      imagenUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
      rolId: rolMesero?.id
    },
    {
      rut: '66666666-6',
      correo: 'sofia.admin@gastrosuite.com',
      nombre: 'Sofía',
      apellidoPaterno: 'Valdés',
      estado: 'A',
      codigoPin: '6677',
      imagenUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
      rolId: rolAdmin?.id
    }
  ];

  for (const u of usuariosMock) {
    const existe = await prisma.usuario.findUnique({ where: { rut: u.rut } });
    if (!existe) {
      await prisma.usuario.create({
        data: {
          rut: u.rut,
          correo: u.correo,
          nombre: u.nombre,
          apellidoPaterno: u.apellidoPaterno,
          estado: u.estado,
          codigoPin: u.codigoPin,
          claveHash: hashDefecto,
          rolesUsuario: u.rolId ? {
            create: [{ rolId: u.rolId }]
          } : undefined
        }
      });
      
      // Actualizar imagenUrl mediante executeRawUnsafe porque puede que Prisma Client aún no la tenga tipada si no hicimos pull
      await prisma.$executeRawUnsafe(`UPDATE usuarios SET imagenUrl = '${u.imagenUrl}' WHERE rut = '${u.rut}'`);
      console.log(`Usuario creado: ${u.nombre}`);
    } else {
      // Actualizar si ya existe para ponerle la foto
      await prisma.$executeRawUnsafe(`UPDATE usuarios SET imagenUrl = '${u.imagenUrl}' WHERE rut = '${u.rut}'`);
      console.log(`Usuario actualizado con foto: ${u.nombre}`);
    }
  }

  console.log('Seed de personal finalizado.');
}

main().finally(() => prisma.$disconnect());
