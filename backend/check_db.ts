import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrlStr = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/gastrosuite';
const adapter = new PrismaMariaDb(dbUrlStr);
const prisma = new PrismaClient({ adapter });

async function main() {
  const areas = await prisma.areaSalon.count();
  const mesas = await prisma.mesa.count();
  const categorias = await prisma.categoria.count();
  const productos = await prisma.producto.count();
  
  console.log(`Areas: ${areas}`);
  console.log(`Mesas: ${mesas}`);
  console.log(`Categorias: ${categorias}`);
  console.log(`Productos: ${productos}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
