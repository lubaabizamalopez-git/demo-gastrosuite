const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool(process.env.DATABASE_URL.replace('mysql://', 'mariadb://'));
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

prisma.pedido.create({ 
  data: { 
    tipoPedido: 'SALON', 
    estado: 'PENDIENTE', 
    mesaId: null,
    meseroId: null,
    subtotal: 10, 
    impuestos: 1.9, 
    total: 11.9, 
    items: { 
      create: [{ 
        productoId: '29dc67ea-cc61-4c44-b1c0-3e8a2c3151d8', 
        cantidad: 1, 
        precioUnitario: 13.5, 
        precioTotal: 13.5, 
        areaPreparacion: 'COCINA', 
        varianteId: null 
      }] 
    } 
  } 
}).then(res => console.log("SUCCESS", res)).catch(err => console.error("ERROR", err.message)).finally(() => { prisma.$disconnect(); pool.end(); });
