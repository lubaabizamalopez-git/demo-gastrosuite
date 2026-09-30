const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating DB states to bypass Data Truncated enum constraints...");
  
  // First, we need to temporarily convert the enum to VARCHAR to allow changing it,
  // or just alter it directly using ALTER TABLE because we are changing the Enum itself.
  // Actually, wait! The database schema has ENUM. We can't insert 'D' into ENUM('LIBRE','OCUPADA'...) 
  // because MariaDB will reject it!
  // We need to ALTER the table first to include the NEW enum values AND the old ones.
  // Then UPDATE the records.
  // Then ALTER the table again to remove the OLD enum values.
  
  // Wait, Prisma generates the ALTER TABLE with only the new enums.
  // Let's just convert the column to VARCHAR, update the data, and then run prisma db push!
  
  await prisma.$executeRawUnsafe(`ALTER TABLE mesas MODIFY COLUMN estado VARCHAR(50)`);
  
  await prisma.$executeRawUnsafe(`UPDATE mesas SET estado = 'D' WHERE estado = 'LIBRE'`);
  await prisma.$executeRawUnsafe(`UPDATE mesas SET estado = 'CS' WHERE estado = 'CUENTA_PEDIDA'`);
  await prisma.$executeRawUnsafe(`UPDATE mesas SET estado = 'R' WHERE estado = 'RESERVADA'`);
  await prisma.$executeRawUnsafe(`UPDATE mesas SET estado = 'O' WHERE estado = 'OCUPADA'`);
  await prisma.$executeRawUnsafe(`UPDATE mesas SET estado = 'L' WHERE estado = 'LIMPIANDO'`);
  await prisma.$executeRawUnsafe(`UPDATE mesas SET estado = 'EM' WHERE estado NOT IN ('D', 'CS', 'R', 'O', 'L')`);
  
  console.log("Updated data to use short codes. Prisma can now safely push the schema.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
