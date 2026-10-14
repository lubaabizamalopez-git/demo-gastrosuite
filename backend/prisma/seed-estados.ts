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
  console.log('Sembrando estados de pedido estándar...');

  const estados = [
    // 1. Para Servir (SALON)
    { codigo: 'INGRESADO', canal: 'SALON', paso: 1, nombre: 'Ingresado', descripcion: 'El pedido se anotó en la caja o entró desde una app/web.', colorHex: '#D96B27', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'EN_COCINA', canal: 'SALON', paso: 2, nombre: 'En Cocina', descripcion: 'El cocinero ya está preparando la comida o sirviendo la bebida.', colorHex: '#5E8237', esAlerta: false, tiempoMaximoMinutos: 20 },
    { codigo: 'LISTO_MESA', canal: 'SALON', paso: 3, nombre: 'Listo para Mesa', descripcion: 'La comida está terminada en el mostrador.', colorHex: '#C47D2B', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'SERVIDO', canal: 'SALON', paso: 4, nombre: 'Servido', descripcion: 'El garzón ya dejó el plato en la mesa. El cliente está comiendo.', colorHex: '#8A6E85', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'PAGADO_CERRADO', canal: 'SALON', paso: 6, nombre: 'Pagado y Cerrado', descripcion: 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', colorHex: '#4A545C', esAlerta: false, tiempoMaximoMinutos: null },

    // 2. Para Llevar (PARA_LLEVAR)
    { codigo: 'INGRESADO', canal: 'PARA_LLEVAR', paso: 1, nombre: 'Ingresado', descripcion: 'El pedido se anotó en la caja o entró desde una app/web.', colorHex: '#D96B27', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'EN_COCINA', canal: 'PARA_LLEVAR', paso: 2, nombre: 'En Cocina', descripcion: 'El cocinero ya está preparando la comida o sirviendo la bebida.', colorHex: '#5E8237', esAlerta: false, tiempoMaximoMinutos: 20 },
    { codigo: 'LISTO_RETIRO', canal: 'PARA_LLEVAR', paso: 3, nombre: 'Listo para Retiro', descripcion: 'La comida está empaquetada lista para retiro.', colorHex: '#C47D2B', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'ENTREGADO', canal: 'PARA_LLEVAR', paso: 6, nombre: 'Entregado', descripcion: 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', colorHex: '#4A545C', esAlerta: false, tiempoMaximoMinutos: null },

    // 3. Delivery (DELIVERY)
    { codigo: 'INGRESADO', canal: 'DELIVERY', paso: 1, nombre: 'Ingresado', descripcion: 'El pedido se anotó en la caja o entró desde una app/web.', colorHex: '#D96B27', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'EN_COCINA', canal: 'DELIVERY', paso: 2, nombre: 'En Cocina', descripcion: 'El cocinero ya está preparando la comida o sirviendo la bebida.', colorHex: '#5E8237', esAlerta: false, tiempoMaximoMinutos: 20 },
    { codigo: 'LISTO_ENVIO', canal: 'DELIVERY', paso: 3, nombre: 'Listo para Envío', descripcion: 'La comida está empaquetada lista para el repartidor.', colorHex: '#C47D2B', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'EN_CAMINO', canal: 'DELIVERY', paso: 5, nombre: 'En Camino', descripcion: 'El repartidor lleva el pedido hacia la casa del cliente.', colorHex: '#3B82F6', esAlerta: false, tiempoMaximoMinutos: null },
    { codigo: 'ENTREGADO', canal: 'DELIVERY', paso: 6, nombre: 'Entregado', descripcion: 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', colorHex: '#4A545C', esAlerta: false, tiempoMaximoMinutos: null },

    // 4. Alertas Obligatorias (TODOS)
    { codigo: 'CANCELADO', canal: 'TODOS', paso: 99, nombre: 'Cancelado', descripcion: 'Se anula el pedido (error al anotarlo, desistimiento o falta de insumo).', colorHex: '#A33129', esAlerta: true, tiempoMaximoMinutos: null },
    { codigo: 'RETRASADO', canal: 'TODOS', paso: 98, nombre: 'Retrasado', descripcion: 'Alerta visual automática si el pedido pasa más de 20 minutos en cocina.', colorHex: '#D96B27', esAlerta: true, tiempoMaximoMinutos: 20 }
  ];

  for (const item of estados) {
    const existe = await (prisma as any).estadoPedidoConfig.findFirst({
      where: { codigo: item.codigo, canal: item.canal }
    });

    if (!existe) {
      await (prisma as any).estadoPedidoConfig.create({
        data: {
          codigo: item.codigo,
          canal: item.canal,
          paso: item.paso,
          nombre: item.nombre,
          descripcion: item.descripcion,
          colorHex: item.colorHex,
          esAlerta: item.esAlerta,
          tiempoMaximoMinutos: item.tiempoMaximoMinutos,
          estado: 'A'
        }
      });
    }
  }

  console.log('✅ Estados de pedido sembrados con éxito en la base de datos MariaDB.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
