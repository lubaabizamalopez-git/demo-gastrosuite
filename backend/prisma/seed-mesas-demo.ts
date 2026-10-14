import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, EstadoMesa, TipoPedido, EstadoPedido } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const dbUrl = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({ 
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1)
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Configurando mesas demo con todos los tipos y colores...');

  // Buscar Salón Principal por ids (17) y validar id
  const salon = await prisma.areaSalon.findFirst({
    where: { ids: 17 }
  });

  if (!salon) {
    console.error('No se encontró el Salón Principal con ids 17');
    return;
  }

  // Eliminar pedidos asociados a mesas del salón principal para recrear limpiamente
  const mesasExistentes = await prisma.mesa.findMany({
    where: { areaSalonId: salon.id }
  });

  for (const m of mesasExistentes) {
    await prisma.pedido.deleteMany({
      where: { mesaId: m.id }
    });
  }

  await prisma.mesa.deleteMany({
    where: { areaSalonId: salon.id }
  });

  // Configuración de las mesas a crear:
  const mesasConfig = [
    { numeroMesa: 'M1', capacidad: 4, shape: 'redonda', estado: EstadoMesa.D, posX: 50, posY: 50, monto: 0 },
    { numeroMesa: 'M2', capacidad: 4, shape: 'redonda', estado: EstadoMesa.O, posX: 250, posY: 50, monto: 15500 },
    { numeroMesa: 'M3', capacidad: 4, shape: 'cuadrada', estado: EstadoMesa.CS, posX: 450, posY: 50, monto: 34900 },
    { numeroMesa: 'M4', capacidad: 2, shape: 'cuadrada', estado: EstadoMesa.R, posX: 650, posY: 50, monto: 0 },
    { numeroMesa: 'M5', capacidad: 6, shape: 'rectangular', estado: EstadoMesa.O, posX: 50, posY: 260, monto: 58000 },
    { numeroMesa: 'M6', capacidad: 6, shape: 'rectangular', estado: EstadoMesa.L, posX: 300, posY: 260, monto: 0 },
    { numeroMesa: 'B1', capacidad: 1, shape: 'barra', estado: EstadoMesa.D, posX: 550, posY: 260, monto: 0 },
    { numeroMesa: 'B2', capacidad: 1, shape: 'barra', estado: EstadoMesa.EM, posX: 700, posY: 260, monto: 0 },
  ];

  for (const mc of mesasConfig) {
    const mesaCreada = await prisma.mesa.create({
      data: {
        areaSalonId: salon.id,
        numeroMesa: mc.numeroMesa,
        capacidad: mc.capacidad,
        shape: mc.shape,
        estado: mc.estado,
        posX: mc.posX,
        posY: mc.posY
      }
    });

    console.log(`Mesa ${mesaCreada.numeroMesa} creada (ids: ${mesaCreada.ids}, shape: ${mc.shape}, estado: ${mc.estado})`);

    // Si tiene monto asignado, creamos un pedido activo para que refleje el total
    if (mc.monto > 0) {
      await prisma.pedido.create({
        data: {
          tipoPedido: TipoPedido.SALON,
          estado: EstadoPedido.EN_COCINA,
          mesaId: mesaCreada.id,
          total: mc.monto,
          subtotal: Math.round(mc.monto / 1.19),
          impuestos: mc.monto - Math.round(mc.monto / 1.19),
          notas: `Mesa ${mc.numeroMesa} activa para demo`
        }
      });
      console.log(`  -> Pedido de demo creado para Mesa ${mesaCreada.numeroMesa}: $${mc.monto}`);
    }
  }

  console.log('¡Mesas demo creadas con éxito!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
