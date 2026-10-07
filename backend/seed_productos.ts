import { PrismaClient, AreaPreparacion } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrlStr = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/gastrosuite';
const adapter = new PrismaMariaDb(dbUrlStr);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de productos...');

  // 1. Asegurar categorías
  let catPrincipal = await prisma.categoria.findFirst({ where: { nombre: 'Platos Principales' } });
  if (!catPrincipal) {
    catPrincipal = await prisma.categoria.create({
      data: {
        nombre: 'Platos Principales',
        icono: 'restaurant',
        estado: 'A',
        orden: 1,
      }
    });
  }

  let catBebidas = await prisma.categoria.findFirst({ where: { nombre: 'Bebidas' } });
  if (!catBebidas) {
    catBebidas = await prisma.categoria.create({
      data: {
        nombre: 'Bebidas',
        icono: 'local_bar',
        estado: 'A',
        orden: 2,
      }
    });
  }

  let catPostres = await prisma.categoria.findFirst({ where: { nombre: 'Postres' } });
  if (!catPostres) {
    catPostres = await prisma.categoria.create({
      data: {
        nombre: 'Postres',
        icono: 'cake',
        estado: 'A',
        orden: 3,
      }
    });
  }

  const productos = [
    {
      categoriaId: catPrincipal.id,
      nombre: 'Hamburguesa Doble Queso',
      descripcion: 'Doble carne de res, doble queso cheddar, lechuga, tomate y salsa de la casa.',
      precio: 8500,
      sku: 'HB-001',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA,
    },
    {
      categoriaId: catPrincipal.id,
      nombre: 'Pizza Pepperoni Familiar',
      descripcion: 'Masa artesanal a la piedra, salsa de tomate, mozzarella y abundante pepperoni.',
      precio: 12000,
      sku: 'PZ-001',
      imagen: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA,
    },
    {
      categoriaId: catPrincipal.id,
      nombre: 'Ensalada César con Pollo',
      descripcion: 'Mix de lechugas, crutones, queso parmesano, pollo grillado y aderezo César.',
      precio: 7000,
      sku: 'EN-001',
      imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA,
    },
    {
      categoriaId: catPrincipal.id,
      nombre: 'Pasta Alfredo',
      descripcion: 'Fettuccine en salsa cremosa de queso parmesano y ajo con toque de perejil.',
      precio: 9500,
      sku: 'PS-001',
      imagen: 'https://images.unsplash.com/photo-1621996316561-6878f3e46864?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA,
    },
    {
      categoriaId: catPrincipal.id,
      nombre: 'Bife de Chorizo (300g)',
      descripcion: 'Corte premium a la parrilla, acompañado de papas rústicas o ensalada.',
      precio: 15000,
      sku: 'CR-001',
      imagen: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.PARRILLA,
    },
    {
      categoriaId: catPrincipal.id,
      nombre: 'Sushi Roll Salmón Palta',
      descripcion: '8 cortes envueltos en sésamo con salmón fresco, palta y queso crema.',
      precio: 8900,
      sku: 'SS-001',
      imagen: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA,
    },
    {
      categoriaId: catPrincipal.id,
      nombre: 'Tacos Al Pastor (3 un.)',
      descripcion: 'Tortillas de maíz con cerdo marinado, piña, cilantro y cebolla morada.',
      precio: 7500,
      sku: 'TC-001',
      imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA,
    },
    {
      categoriaId: catPrincipal.id,
      nombre: 'Sopa de Mariscos',
      descripcion: 'Consomé concentrado con mix de mariscos frescos, toque de cilantro y limón.',
      precio: 8200,
      sku: 'SP-001',
      imagen: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.COCINA,
    },
    {
      categoriaId: catBebidas.id,
      nombre: 'Cerveza Artesanal IPA',
      descripcion: 'Cerveza de barril con notas cítricas y amargor intenso (500ml).',
      precio: 4500,
      sku: 'BB-001',
      imagen: 'https://images.unsplash.com/photo-1657223065096-764506fbc397?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.BAR,
    },
    {
      categoriaId: catPostres.id,
      nombre: 'Cheesecake de Frutos Rojos',
      descripcion: 'Tarta de queso horneada con base de galleta y coulis de frutos del bosque.',
      precio: 5500,
      sku: 'PT-001',
      imagen: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=500&auto=format&fit=crop',
      areaPreparacion: AreaPreparacion.POSTRES,
    }
  ];

  for (const prod of productos) {
    const existe = await prisma.producto.findFirst({ where: { nombre: prod.nombre } });
    if (!existe) {
      await prisma.producto.create({
        data: prod
      });
      console.log(`Producto creado: ${prod.nombre}`);
    } else {
      console.log(`Producto ya existe: ${prod.nombre}`);
    }
  }

  console.log('Seed finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
