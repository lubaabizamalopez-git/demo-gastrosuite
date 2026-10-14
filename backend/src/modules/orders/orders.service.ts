import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { EstadoPedido } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async createOrder(data: any) {
    // 1. Crear la cabecera del pedido
    const newOrder = await this.prisma.pedido.create({
      data: {
        tipoPedido: data.tipoPedido || 'SALON',
        estado: EstadoPedido.PENDIENTE,
        mesaId: data.mesaId || null,
        meseroId: data.meseroId || null,
        nombreCliente: data.nombreCliente || null,
        subtotal: data.subtotal || 0,
        impuestos: data.impuestos || 0,
        total: data.total || 0,
      }
    });

    // 2. Crear los ítems asociados al pedido
    const itemsCreated = [];
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const itemCreated = await this.prisma.itemPedido.create({
          data: {
            pedidoId: newOrder.id,
            productoId: item.productoId,
            cantidad: Number(item.cantidad) || 1,
            precioUnitario: Number(item.precioUnitario) || 0,
            precioTotal: Number(item.precioTotal) || (Number(item.precioUnitario) * Number(item.cantidad)),
            areaPreparacion: item.areaPreparacion || 'COCINA',
            varianteId: item.varianteId || null,
            notas: item.notas || null
          }
        });
        itemsCreated.push(itemCreated);
      }
    }

    // 3. Vincular datos de productos para la comanda y KDS
    const productoIds = itemsCreated.map(i => i.productoId);
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds } }
    });
    const prodMap = new Map(productos.map(p => [p.id, p]));

    const mesa = newOrder.mesaId
      ? await this.prisma.mesa.findUnique({ where: { id: newOrder.mesaId } })
      : null;

    // Si es en mesa, marcar mesa como Ocupada ('O')
    if (newOrder.mesaId) {
      await this.prisma.mesa.update({
        where: { id: newOrder.mesaId },
        data: { estado: 'O' }
      }).catch(() => {});
    }

    const fullOrder = {
      ...newOrder,
      mesa,
      items: itemsCreated.map(i => ({
        ...i,
        producto: prodMap.get(i.productoId) || null
      }))
    };

    // 4. Emitir el evento de nuevo pedido al KDS mediante WebSocket
    this.eventsGateway.emitNuevoPedido(fullOrder);

    return fullOrder;
  }

  async getPendingOrders() {
    const pedidos = await this.prisma.pedido.findMany({
      where: { 
        estado: { in: [EstadoPedido.PENDIENTE, EstadoPedido.EN_COCINA] } 
      },
      include: { mesa: true, mesero: true },
      orderBy: { creadoEn: 'asc' }
    });

    return this.attachItemsToPedidos(pedidos);
  }

  async getAllOrders() {
    const pedidos = await this.prisma.pedido.findMany({
      include: { mesa: true, mesero: true },
      orderBy: { creadoEn: 'desc' }
    });

    return this.attachItemsToPedidos(pedidos);
  }

  private async attachItemsToPedidos(pedidos: any[]) {
    if (!pedidos || pedidos.length === 0) return [];
    
    const pedidoIds = pedidos.map(p => p.id);
    const items = await this.prisma.itemPedido.findMany({
      where: { pedidoId: { in: pedidoIds } }
    });
    
    const productoIds = items.map(i => i.productoId);
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds } }
    });
    const prodMap = new Map(productos.map(p => [p.id, p]));

    const itemsWithProd = items.map(i => ({
      ...i,
      producto: prodMap.get(i.productoId) || null
    }));

    return pedidos.map(p => ({
      ...p,
      items: itemsWithProd.filter(i => i.pedidoId === p.id)
    }));
  }

  async obtenerEstados(canal?: string) {
    try {
      const whereClause: any = { estado: 'A' };
      if (canal) {
        whereClause.OR = [
          { canal: canal },
          { canal: 'TODOS' }
        ];
      }
      return await (this.prisma as any).estadoPedidoConfig.findMany({
        where: whereClause,
        orderBy: [{ paso: 'asc' }, { ids: 'asc' }]
      });
    } catch {
      return this.obtenerEstadosFallback(canal);
    }
  }

  private obtenerEstadosFallback(canal?: string) {
    const todos = [
      { codigo: 'INGRESADO', canal: 'TODOS', paso: 1, nombre: 'Ingresado', descripcion: 'El pedido se anotó en la caja o entró desde una app/web.', colorHex: '#D96B27', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'EN_COCINA', canal: 'TODOS', paso: 2, nombre: 'En Cocina', descripcion: 'El cocinero ya está preparando la comida o sirviendo la bebida.', colorHex: '#5E8237', esAlerta: false, tiempoMaximoMinutos: 20 },
      { codigo: 'LISTO_MESA', canal: 'SALON', paso: 3, nombre: 'Listo para Mesa', descripcion: 'La comida está terminada en el mostrador.', colorHex: '#C47D2B', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'SERVIDO', canal: 'SALON', paso: 4, nombre: 'Servido', descripcion: 'El garzón ya dejó el plato en la mesa. El cliente está comiendo.', colorHex: '#8A6E85', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'PAGADO_CERRADO', canal: 'SALON', paso: 6, nombre: 'Pagado y Cerrado', descripcion: 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', colorHex: '#4A545C', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'LISTO_RETIRO', canal: 'PARA_LLEVAR', paso: 3, nombre: 'Listo para Retiro', descripcion: 'La comida está empaquetada lista para retiro.', colorHex: '#C47D2B', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'LISTO_ENVIO', canal: 'DELIVERY', paso: 3, nombre: 'Listo para Envío', descripcion: 'La comida está empaquetada lista para el repartidor.', colorHex: '#C47D2B', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'EN_CAMINO', canal: 'DELIVERY', paso: 5, nombre: 'En Camino', descripcion: 'El repartidor lleva el pedido hacia la casa del cliente.', colorHex: '#3B82F6', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'ENTREGADO', canal: 'PARA_LLEVAR', paso: 6, nombre: 'Entregado', descripcion: 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', colorHex: '#4A545C', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'ENTREGADO', canal: 'DELIVERY', paso: 6, nombre: 'Entregado', descripcion: 'Fin del flujo. El dinero está en caja y el cliente tiene su comida.', colorHex: '#4A545C', esAlerta: false, tiempoMaximoMinutos: null },
      { codigo: 'CANCELADO', canal: 'TODOS', paso: 99, nombre: 'Cancelado', descripcion: 'Se anula el pedido (error al anotarlo, desistimiento o falta de insumo).', colorHex: '#A33129', esAlerta: true, tiempoMaximoMinutos: null },
      { codigo: 'RETRASADO', canal: 'TODOS', paso: 98, nombre: 'Retrasado', descripcion: 'Alerta visual automática si el pedido pasa más de 20 minutos en cocina.', colorHex: '#D96B27', esAlerta: true, tiempoMaximoMinutos: 20 },
    ];
    if (!canal) return todos;
    return todos.filter(e => e.canal === canal || e.canal === 'TODOS');
  }
}


