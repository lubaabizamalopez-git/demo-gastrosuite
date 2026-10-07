import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const rolMesero = await prisma.rol.findFirst({ where: { nombre: 'MESERO' } });
  const rolCajero = await prisma.rol.findFirst({ where: { nombre: 'CAJERO' } });
  
  if (!rolMesero || !rolCajero) {
    console.error('Roles no encontrados');
    return;
  }

  const region = await prisma.region.findFirst();
  const ciudad = region ? await prisma.ciudad.findFirst({ where: { id_region: region.id_region } }) : null;
  const comuna = ciudad ? await prisma.comuna.findFirst({ where: { id_ciudad: ciudad.id_ciudad } }) : null;

  const salt = await bcrypt.genSalt(10);
  const claveHash = await bcrypt.hash('12345678', salt);

  for (let i = 1; i <= 10; i++) {
    const rutStr = `1${i}000000`;
    const existe = await prisma.usuario.findFirst({ where: { correo: `empleado${i}@gastrosuite.com` } });
    if (existe) continue;

    await prisma.usuario.create({
      data: {
        nombre: `Funcionario ${i}`,
        apellidoPaterno: `Paterno${i}`,
        apellidoMaterno: `Materno${i}`,
        correo: `empleado${i}@gastrosuite.com`,
        claveHash,
        codigoPin: `100${i === 10 ? '0' : i}`,
        estado: 'A',
        tipoDocumento: 'RUT',
        rut: rutStr,
        dv: 'K',
        telefono: `+5691234567${i % 10}`,
        direccion: `Direccion de prueba ${i}`,
        regionId: region ? region.id_region : null,
        ciudadId: ciudad ? ciudad.id_ciudad : null,
        comunaId: comuna ? comuna.id_comuna : null,
        contactoEmergenciaNombre: `Contacto ${i}`,
        contactoEmergenciaTelefono: `+5699876543${i % 10}`,
        imagenUrl: `https://i.pravatar.cc/150?img=${i + 10}`,
        rolesUsuario: {
          create: [
            { rolId: i % 2 === 0 ? rolMesero.id : rolCajero.id }
          ]
        }
      }
    });
  }
  
  console.log('Seeded 10 empleados con imágenes (URLs externas).');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
