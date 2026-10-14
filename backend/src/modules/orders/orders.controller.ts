import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller(['api/pedidos', 'api/v1/pedidos', 'pedidos'])
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('estados')
  async getEstados(@Query('canal') canal?: string) {
    return this.ordersService.obtenerEstados(canal);
  }

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

