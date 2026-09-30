const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const roles = await prisma.$queryRawUnsafe('SELECT * FROM roles');
  console.log('Roles:', roles);
  
  const imps = await prisma.$queryRawUnsafe('SELECT * FROM configuraciones_impresora');
  console.log('Impresoras:', imps);
}
main().catch(console.error).finally(() => prisma.$disconnect());
