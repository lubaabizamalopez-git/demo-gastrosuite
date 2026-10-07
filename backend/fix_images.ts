import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
dotenv.config();

const dbUrlStr = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/gastrosuite';
const adapter = new PrismaMariaDb(dbUrlStr);
const prisma = new PrismaClient({ adapter });

const imagenesExtra = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566492031523-87d2819128aa?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
];

async function main() {
  console.log('Fijando imágenes rotas y añadiendo más ejemplos...');

  // 1. Arreglar todos los que tienen 'NULL' o no tienen imagen
  const todos = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM usuarios WHERE imagenUrl IS NULL OR imagenUrl = 'NULL'`);
  
  for (let i = 0; i < todos.length; i++) {
    const usr = todos[i];
    // Asignar una imagen del pool usando el index
    const url = imagenesExtra[i % imagenesExtra.length];
    await prisma.$executeRawUnsafe(`UPDATE usuarios SET imagenUrl = '${url}' WHERE id = '${usr.id}'`);
    console.log(`Foto asignada al usuario existente: ${usr.nombre}`);
  }

  // 2. Generar 5 ejemplos nuevos
  const rolMesero = await prisma.rol.findUnique({ where: { nombre: 'MESERO' } });
  const rolCajero = await prisma.rol.findUnique({ where: { nombre: 'CAJERO' } });
  
  const salt = await bcrypt.genSalt(10);
  const hashDefecto = await bcrypt.hash('1234****', salt);

  const nuevosUsuarios = [
    { rut: '77777777-7', correo: 'marcos@gastrosuite.com', nombre: 'Marcos', apellidoPaterno: 'Ríos', rolId: rolMesero?.id },
    { rut: '88888888-8', correo: 'lucia@gastrosuite.com', nombre: 'Lucía', apellidoPaterno: 'Blanco', rolId: rolCajero?.id },
    { rut: '99999999-9', correo: 'jorge@gastrosuite.com', nombre: 'Jorge', apellidoPaterno: 'Pérez', rolId: rolMesero?.id },
    { rut: '10101010-1', correo: 'camila@gastrosuite.com', nombre: 'Camila', apellidoPaterno: 'Soto', rolId: rolMesero?.id },
    { rut: '12121212-2', correo: 'roberto@gastrosuite.com', nombre: 'Roberto', apellidoPaterno: 'Guzmán', rolId: rolCajero?.id },
  ];

  for (let i = 0; i < nuevosUsuarios.length; i++) {
    const u = nuevosUsuarios[i];
    const existe = await prisma.usuario.findUnique({ where: { rut: u.rut } });
    if (!existe) {
      const imgUrl = imagenesExtra[(i + 5) % imagenesExtra.length]; // para no repetir las mismas del principio
      await prisma.usuario.create({
        data: {
          rut: u.rut,
          correo: u.correo,
          nombre: u.nombre,
          apellidoPaterno: u.apellidoPaterno,
          estado: 'A',
          codigoPin: `${i+7}${i+7}00`,
          claveHash: hashDefecto,
          rolesUsuario: u.rolId ? {
            create: [{ rolId: u.rolId }]
          } : undefined
        }
      });
      await prisma.$executeRawUnsafe(`UPDATE usuarios SET imagenUrl = '${imgUrl}' WHERE rut = '${u.rut}'`);
      console.log(`Nuevo usuario de ejemplo creado: ${u.nombre}`);
    }
  }

  console.log('Terminado.');
}

main().finally(() => prisma.$disconnect());
