const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  
  await prisma.usuario.update({
    where: { correo: 'admin@gastrosuite.com' },
    data: { claveHash: hash }
  });
  
  console.log('Contraseña de admin actualizada correctamente a 123456');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
