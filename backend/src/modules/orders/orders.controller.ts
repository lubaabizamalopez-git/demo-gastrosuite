import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('api/pedidos')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() data: any) {
    return this.ordersService.createOrder(data);
  }

  @Get('kds/pendientes')
  async getPendingForKds() {
    return this.ordersService.getPendingOrders();
  }

  @Get()
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }
}
