const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pedido.create({ 
  data: { 
    tipoPedido: 'SALON', 
    estado: 'PENDIENTE', 
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
}).then(console.log).catch(console.error).finally(() => { prisma.$disconnect() });
