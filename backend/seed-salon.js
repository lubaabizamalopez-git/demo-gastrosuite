require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const dbUrlStr = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/gastrosuite';
const adapter = new PrismaMariaDb(dbUrlStr);
const prisma = new PrismaClient({ adapter });

async function main() {
  const area1 = await prisma.areaSalon.create({ data: { nombre: 'Terraza Principal', orden: 1 } });
  const area2 = await prisma.areaSalon.create({ data: { nombre: 'Salón VIP', orden: 2 } });
  
  await prisma.mesa.create({ data: { areaSalonId: area1.id, numeroMesa: 'T-01', capacidad: 4, estado: 'LIBRE' } });
  await prisma.mesa.create({ data: { areaSalonId: area1.id, numeroMesa: 'T-02', capacidad: 2, estado: 'OCUPADA' } });
  await prisma.mesa.create({ data: { areaSalonId: area2.id, numeroMesa: 'V-01', capacidad: 6, estado: 'RESERVADA' } });
  
  console.log('Datos creados con éxito');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
