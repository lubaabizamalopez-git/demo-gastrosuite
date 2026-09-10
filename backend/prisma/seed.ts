import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, NombreRol, AreaPreparacion, UnidadMedida, EstadoMesa, TipoPedido, EstadoPedido, EstadoItemPedido, TipoConexion } from '@prisma/client';
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
  console.log('Iniciando el seeding de la base de datos...');

  // 1. Roles
  const roles = await Promise.all([
    prisma.rol.upsert({ where: { nombre: NombreRol.SUPERADMIN }, update: {}, create: { nombre: NombreRol.SUPERADMIN, descripcion: 'Acceso total al sistema' } }),
    prisma.rol.upsert({ where: { nombre: NombreRol.ADMINISTRADOR }, update: {}, create: { nombre: NombreRol.ADMINISTRADOR, descripcion: 'Administración del local' } }),
    prisma.rol.upsert({ where: { nombre: NombreRol.CAJERO }, update: {}, create: { nombre: NombreRol.CAJERO, descripcion: 'Acceso a caja y cobros' } }),
    prisma.rol.upsert({ where: { nombre: NombreRol.MESERO }, update: {}, create: { nombre: NombreRol.MESERO, descripcion: 'Atención de mesas' } })
  ]);

  // 2. Usuarios
  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@gastrosuite.com' },
    update: {},
    create: {
      correo: 'admin@gastrosuite.com',
      claveHash: '$2b$10$X7...hashfalso', // En producción debe ser un hash real de bcrypt
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      codigoPin: '1234',
      rolesUsuario: { create: { rolId: roles[0].id } }
    }
  });

  const mesero = await prisma.usuario.upsert({
    where: { correo: 'mesero1@gastrosuite.com' },
    update: {},
    create: {
      correo: 'mesero1@gastrosuite.com',
      claveHash: '$2b$10$X7...hashfalso',
      nombre: 'Carlos',
      apellidoPaterno: 'Gómez',
      codigoPin: '5678',
      rolesUsuario: { create: { rolId: roles[3].id } }
    }
  });

  // 3. Categorías
  const catHamburguesas = await prisma.categoria.create({ data: { nombre: 'Hamburguesas', orden: 1 } });
  const catBebidas = await prisma.categoria.create({ data: { nombre: 'Bebidas', orden: 2 } });
  const catPostres = await prisma.categoria.create({ data: { nombre: 'Postres', orden: 3 } });

  // 4. Productos
  const prod1 = await prisma.producto.create({
    data: {
      categoriaId: catHamburguesas.id,
      nombre: 'Cheeseburger Clásica',
      precio: 8.99,
      areaPreparacion: AreaPreparacion.COCINA
    }
  });

  const prod2 = await prisma.producto.create({
    data: {
      categoriaId: catHamburguesas.id,
      nombre: 'Bacon Deluxe',
      precio: 10.99,
      areaPreparacion: AreaPreparacion.COCINA
    }
  });

  const prod3 = await prisma.producto.create({
    data: {
      categoriaId: catBebidas.id,
      nombre: 'Coca Cola',
      precio: 2.50,
      areaPreparacion: AreaPreparacion.BAR
    }
  });

  const prod4 = await prisma.producto.create({
    data: {
      categoriaId: catPostres.id,
      nombre: 'Cheesecake',
      precio: 4.50,
      areaPreparacion: AreaPreparacion.POSTRES
    }
  });

  // 5. Insumos
  const insumoPan = await prisma.insumo.create({ data: { nombre: 'Pan de Hamburguesa', unidad: UnidadMedida.UNIDADES, stockActual: 100 } });
  const insumoCarne = await prisma.insumo.create({ data: { nombre: 'Carne Molida', unidad: UnidadMedida.GRAMOS, stockActual: 5000 } });

  // 6. Recetas
  await prisma.recetaProducto.create({ data: { productoId: prod1.id, insumoId: insumoPan.id, cantidad: 1 } });
  await prisma.recetaProducto.create({ data: { productoId: prod1.id, insumoId: insumoCarne.id, cantidad: 200 } });

  // 7. Área Salón y Mesas
  const salon = await prisma.areaSalon.create({ data: { nombre: 'Salón Principal', orden: 1 } });
  const terraza = await prisma.areaSalon.create({ data: { nombre: 'Terraza', orden: 2 } });

  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: 'M1', capacidad: 4, estado: EstadoMesa.LIBRE } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: 'M2', capacidad: 2, estado: EstadoMesa.LIBRE } });
  const mesaOcupada = await prisma.mesa.create({ data: { areaSalonId: terraza.id, numeroMesa: 'T1', capacidad: 4, estado: EstadoMesa.OCUPADA } });
  await prisma.mesa.create({ data: { areaSalonId: terraza.id, numeroMesa: 'T2', capacidad: 6, estado: EstadoMesa.LIBRE } });

  // 8. Métodos de Pago
  await prisma.metodoPago.upsert({ where: { codigo: 'EFECTIVO' }, update: {}, create: { nombre: 'Efectivo', codigo: 'EFECTIVO' } });
  await prisma.metodoPago.upsert({ where: { codigo: 'DEBITO' }, update: {}, create: { nombre: 'Tarjeta Débito', codigo: 'DEBITO' } });
  await prisma.metodoPago.upsert({ where: { codigo: 'CREDITO' }, update: {}, create: { nombre: 'Tarjeta Crédito', codigo: 'CREDITO' } });

  // 9. Configuración Empresa e Impresora
  await prisma.configuracionEmpresa.create({
    data: {
      nombreEmpresa: 'GastroSuite Demo',
      ruc: '12345678-9',
      direccion: 'Av. Principal 123',
      telefono: '+56912345678',
      simboloMoneda: '$',
      porcentajeImpuesto: 19.00
    }
  });

  await prisma.configuracionImpresora.create({
    data: {
      nombre: 'Impresora Cocina',
      areaDestino: AreaPreparacion.COCINA,
      tipoConexion: TipoConexion.RED_IP,
      direccionIp: '192.168.1.100'
    }
  });

  // 10. Pedido de Ejemplo
  const pedido = await prisma.pedido.create({
    data: {
      tipoPedido: TipoPedido.SALON,
      estado: EstadoPedido.PENDIENTE,
      mesaId: mesaOcupada.id,
      meseroId: mesero.id,
      subtotal: 11.49,
      impuestos: 2.18,
      total: 13.67,
      items: {
        create: [
          {
            productoId: prod1.id,
            cantidad: 1,
            precioUnitario: 8.99,
            precioTotal: 8.99,
            estado: EstadoItemPedido.PENDIENTE,
            areaPreparacion: AreaPreparacion.COCINA
          },
          {
            productoId: prod3.id,
            cantidad: 1,
            precioUnitario: 2.50,
            precioTotal: 2.50,
            estado: EstadoItemPedido.LISTO,
            areaPreparacion: AreaPreparacion.BAR
          }
        ]
      }
    }
  });

  console.log('¡Seeding completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
