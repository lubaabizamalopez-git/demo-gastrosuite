import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { OrdersService } from './src/modules/orders/orders.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ordersService = app.get(OrdersService);
  
  try {
    const res = await ordersService.createOrder({
      tipoPedido: 'SALON',
      subtotal: 10,
      impuestos: 1.9,
      total: 11.9,
      items: [{
        productoId: '29dc67ea-cc61-4c44-b1c0-3e8a2c3151d8',
        cantidad: 1,
        precioUnitario: 13.5,
        precioTotal: 13.5,
        areaPreparacion: 'COCINA',
        varianteId: null
      }]
    });
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('ERROR:', err);
  }
  await app.close();
}
bootstrap();
