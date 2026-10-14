import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
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
  const cols: any = await prisma.$queryRawUnsafe(`DESCRIBE mesas`);
  console.log('MESAS COLUMNS:', cols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
