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
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE mesas ADD COLUMN shape VARCHAR(50) DEFAULT 'redonda'`);
    console.log('Column shape added successfully');
  } catch (err: any) {
    if (err.message?.includes('Duplicate column name')) {
      console.log('Column shape already exists');
    } else {
      console.error('Error adding column:', err);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
