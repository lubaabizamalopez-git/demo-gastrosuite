import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, AreaPreparacion, UnidadMedida, EstadoMesa, TipoPedido, EstadoPedido, EstadoItemPedido, TipoConexion } from '@prisma/client';
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
  console.log('Iniciando el seeding de la base de datos (Demo de Alto Impacto)...');

  // Limpieza previa
  await prisma.pago.deleteMany();
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.mesa.deleteMany();
  await prisma.areaSalon.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();

  // 1. Roles
  const roles = [];
  roles.push(await prisma.rol.create({ data: { nombre: 'SUPERADMIN', descripcion: 'Acceso total al sistema' } }));
  roles.push(await prisma.rol.create({ data: { nombre: 'ADMINISTRADOR', descripcion: 'Administración del local' } }));
  roles.push(await prisma.rol.create({ data: { nombre: 'CAJERO', descripcion: 'Acceso a caja y cobros' } }));
  roles.push(await prisma.rol.create({ data: { nombre: 'MESERO', descripcion: 'Atención de mesas' } }));

  // 2. Usuarios
  const admin = await prisma.usuario.create({
    data: {
      rut: '11111111',
      correo: 'admin@gastrosuite.com',
      claveHash: '$2b$10$X7...hashfalso',
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      codigoPin: '1234',
      rolesUsuario: { create: { rolId: roles[0].id } }
    }
  });

  const mesero = await prisma.usuario.create({
    data: {
      rut: '22222222',
      correo: 'mesero1@gastrosuite.com',
      claveHash: '$2b$10$X7...hashfalso',
      nombre: 'Carlos',
      apellidoPaterno: 'Gómez',
      codigoPin: '5678',
      rolesUsuario: { create: { rolId: roles[3].id } }
    }
  });

  // 3. Categorías Atractivas
  const catHamburguesas = await prisma.categoria.create({ data: { nombre: 'Hamburguesas Premium', icono: 'fa-hamburger', orden: 1 } });
  const catPizzas = await prisma.categoria.create({ data: { nombre: 'Pizzas Artesanales', icono: 'fa-pizza-slice', orden: 2 } });
  const catBebidas = await prisma.categoria.create({ data: { nombre: 'Bebidas & Cocteles', icono: 'fa-glass-cheers', orden: 3 } });
  const catPostres = await prisma.categoria.create({ data: { nombre: 'Postres Especiales', icono: 'fa-ice-cream', orden: 4 } });

  // 4. Productos con Fotos Reales (Unsplash)
  const prod1 = await prisma.producto.create({
    data: {
      sku: 'SKU-001',
      categoriaId: catHamburguesas.id,
      nombre: 'Truffle Burger',
      descripcion: 'Doble carne angus, queso suizo, cebolla caramelizada y mayo trufada en pan brioche artesanal.',
      precio: 14.99,
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA
    }
  });

  const prod2 = await prisma.producto.create({
    data: {
      sku: 'SKU-002',
      categoriaId: catHamburguesas.id,
      nombre: 'Spicy BBQ Bacon',
      descripcion: 'Carne premium, tocino crujiente, aros de cebolla, jalapeños y salsa BBQ secreta.',
      precio: 13.50,
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA
    }
  });

  const prod3 = await prisma.producto.create({
    data: {
      sku: 'SKU-003',
      categoriaId: catPizzas.id,
      nombre: 'Margherita Napolitana',
      descripcion: 'Salsa pomodoro San Marzano, mozzarella fior di latte, albahaca fresca y AOVE.',
      precio: 16.00,
      imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA
    }
  });

  const prod4 = await prisma.producto.create({
    data: {
      sku: 'SKU-004',
      categoriaId: catBebidas.id,
      nombre: 'Mojito Tradicional',
      descripcion: 'Ron blanco, menta fresca, lima y un toque de azúcar de caña.',
      precio: 7.50,
      imagen: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.BAR
    }
  });

  const prod5 = await prisma.producto.create({
    data: {
      sku: 'SKU-005',
      categoriaId: catPostres.id,
      nombre: 'Volcán de Chocolate',
      descripcion: 'Lava cake de chocolate belga acompañado de helado de vainilla.',
      precio: 8.90,
      imagen: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.POSTRES
    }
  });
  const prod6 = await prisma.producto.create({
    data: {
      sku: 'SKU-006',
      categoriaId: catPizzas.id,
      nombre: 'Pizza Pepperoni',
      descripcion: 'Doble pepperoni, queso mozzarella y salsa de tomate casera.',
      precio: 15.50,
      imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA
    }
  });

  const prod7 = await prisma.producto.create({
    data: {
      sku: 'SKU-007',
      categoriaId: catHamburguesas.id,
      nombre: 'Veggie Burger',
      descripcion: 'Hamburguesa de lentejas, lechuga, tomate y mayonesa vegana.',
      precio: 12.00,
      imagen: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA
    }
  });

  const prod8 = await prisma.producto.create({
    data: {
      sku: 'SKU-008',
      categoriaId: catBebidas.id,
      nombre: 'Limonada Menta Jengibre',
      descripcion: 'Refrescante limonada natural con toques de menta fresca y jengibre.',
      precio: 5.00,
      imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.BAR
    }
  });

  const prod9 = await prisma.producto.create({
    data: {
      sku: 'SKU-009',
      categoriaId: catPostres.id,
      nombre: 'Cheesecake de Frutos Rojos',
      descripcion: 'Clásico cheesecake estilo NY con salsa de frambuesas y arándanos.',
      precio: 6.50,
      imagen: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.POSTRES
    }
  });

  const prod10 = await prisma.producto.create({
    data: {
      sku: 'SKU-010',
      categoriaId: catBebidas.id,
      nombre: 'Cerveza Artesanal IPA',
      descripcion: 'Cerveza artesanal local, estilo India Pale Ale, 500ml.',
      precio: 6.00,
      imagen: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=600&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.BAR
    }
  });

  // 7. Área Salón y Mesas (Distribución Realista Salón Principal)
  const salon = await prisma.areaSalon.create({ data: { nombre: 'Salón Principal', orden: 1 } });
  const terraza = await prisma.areaSalon.create({ data: { nombre: 'Terraza VIP', orden: 2 } });

  // Barra Superior Centro
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: 'Barra Principal', capacidad: 6, estado: EstadoMesa.O, shape: 'barra', posX: 50, posY: 10 } });

  // Fila 1
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '01', capacidad: 4, estado: EstadoMesa.D, shape: 'cuadrada', posX: 20, posY: 30 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '09', capacidad: 4, estado: EstadoMesa.O, shape: 'redonda', posX: 50, posY: 30 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '05', capacidad: 6, estado: EstadoMesa.D, shape: 'rectangular', posX: 80, posY: 30 } });

  // Fila 2
  const mesa2 = await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '02', capacidad: 6, estado: EstadoMesa.O, shape: 'rectangular', posX: 20, posY: 50 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '10', capacidad: 4, estado: EstadoMesa.D, shape: 'redonda', posX: 50, posY: 50 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '06', capacidad: 4, estado: EstadoMesa.O, shape: 'cuadrada', posX: 80, posY: 50 } });

  // Fila 3
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '03', capacidad: 4, estado: EstadoMesa.CS, shape: 'cuadrada', posX: 20, posY: 70 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '11', capacidad: 4, estado: EstadoMesa.R, shape: 'redonda', posX: 50, posY: 70 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '07', capacidad: 6, estado: EstadoMesa.EM, shape: 'rectangular', posX: 80, posY: 70 } });

  // Fila 4
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '04', capacidad: 6, estado: EstadoMesa.D, shape: 'rectangular', posX: 20, posY: 90 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '12', capacidad: 4, estado: EstadoMesa.L, shape: 'redonda', posX: 50, posY: 90 } });
  await prisma.mesa.create({ data: { areaSalonId: salon.id, numeroMesa: '08', capacidad: 4, estado: EstadoMesa.D, shape: 'cuadrada', posX: 80, posY: 90 } });
  
  await prisma.mesa.create({ data: { areaSalonId: terraza.id, numeroMesa: 'T1', capacidad: 4, estado: EstadoMesa.D, posX: 100, posY: 300 } });
  const mesaT2 = await prisma.mesa.create({ data: { areaSalonId: terraza.id, numeroMesa: 'T2', capacidad: 4, estado: EstadoMesa.O, posX: 300, posY: 300 } });

  // 10. Pedidos de Ejemplo (Para dar vida al Dashboard y KDS)
  
  // Pedido 1: En preparación (Ideal para ver en el KDS)
  const pedido1 = await prisma.pedido.create({
    data: {
      tipoPedido: TipoPedido.SALON,
      estado: EstadoPedido.EN_COCINA,
      mesaId: mesa2.id,
      meseroId: mesero.id,
      subtotal: 30.99,
      impuestos: 5.88,
      total: 36.87
    }
  });

  await prisma.itemPedido.createMany({
    data: [
      { varianteId: null, pedidoId: pedido1.id, productoId: prod1.id, cantidad: 2, precioUnitario: 14.99, precioTotal: 29.98, estado: EstadoItemPedido.PREPARANDO, areaPreparacion: AreaPreparacion.COCINA, notas: 'Una sin cebolla' },
      { varianteId: null, pedidoId: pedido1.id, productoId: prod4.id, cantidad: 1, precioUnitario: 7.50, precioTotal: 7.50, estado: EstadoItemPedido.LISTO, areaPreparacion: AreaPreparacion.BAR }
    ]
  });

  // Pedido 2: Recién ingresado (Pendiente)
  const pedido2 = await prisma.pedido.create({
    data: {
      tipoPedido: TipoPedido.SALON,
      estado: EstadoPedido.PENDIENTE,
      mesaId: mesa3.id,
      meseroId: mesero.id,
      subtotal: 16.00,
      impuestos: 3.04,
      total: 19.04
    }
  });

  await prisma.itemPedido.createMany({
    data: [
      { varianteId: null, pedidoId: pedido2.id, productoId: prod3.id, cantidad: 1, precioUnitario: 16.00, precioTotal: 16.00, estado: EstadoItemPedido.PENDIENTE, areaPreparacion: AreaPreparacion.COCINA }
    ]
  });

  // Pedido 3: Ya pagado (Para sumar métricas en el Dashboard de ventas)
  const pedido3 = await prisma.pedido.create({
    data: {
      tipoPedido: TipoPedido.SALON,
      estado: EstadoPedido.PAGADO,
      mesaId: mesaT2.id,
      meseroId: mesero.id,
      subtotal: 22.40,
      impuestos: 4.25,
      total: 26.65
    }
  });

  await prisma.itemPedido.createMany({
    data: [
      { varianteId: null, pedidoId: pedido3.id, productoId: prod2.id, cantidad: 1, precioUnitario: 13.50, precioTotal: 13.50, estado: EstadoItemPedido.SERVIDO, areaPreparacion: AreaPreparacion.COCINA },
      { varianteId: null, pedidoId: pedido3.id, productoId: prod5.id, cantidad: 1, precioUnitario: 8.90, precioTotal: 8.90, estado: EstadoItemPedido.SERVIDO, areaPreparacion: AreaPreparacion.POSTRES }
    ]
  });

  console.log('¡Seeding de Demo completado con éxito! Se inyectaron productos realistas y órdenes de prueba.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
