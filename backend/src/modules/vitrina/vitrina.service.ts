import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EstadoPedido, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { WebpayService } from './webpay.service';
import { CrearPedidoVitrinaRequest } from './dto/crear-pedido-vitrina.request';

/** Pasos visibles para el cliente cuando no existe la tabla estados_pedido */
const PASOS_RESPALDO = [
  { codigo: 'INGRESADO', canal: 'TODOS', paso: 1, nombre: 'Recibido' },
  { codigo: 'EN_COCINA', canal: 'TODOS', paso: 2, nombre: 'En preparación' },
  { codigo: 'LISTO_RETIRO', canal: 'PARA_LLEVAR', paso: 3, nombre: 'Listo para retiro' },
  { codigo: 'LISTO_ENVIO', canal: 'DELIVERY', paso: 3, nombre: 'Listo para envío' },
  { codigo: 'EN_CAMINO', canal: 'DELIVERY', paso: 5, nombre: 'En camino' },
  { codigo: 'ENTREGADO', canal: 'TODOS', paso: 6, nombre: 'Entregado' },
];

@Injectable()
export class VitrinaService {
  private logger = new Logger('VitrinaService');

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private webpayService: WebpayService,
  ) {}

  // --- EMPRESA Y MENÚ ---

  async obtenerEmpresa(slug: string) {
    const empresa = await this.prisma.empresa.findFirst({ where: { slug, estado: 'A' } });
    if (!empresa) {
      throw new NotFoundException('Restaurante no encontrado');
    }
    return empresa;
  }

  async obtenerInformacionPublica(slug: string) {
    const empresa = await this.obtenerEmpresa(slug);
    return {
      ids: empresa.ids,
      nombre: empresa.nombre,
      slug: empresa.slug,
      descripcion: empresa.descripcion,
      logoUrl: empresa.logoUrl,
      portadaUrl: empresa.portadaUrl,
      telefono: empresa.telefono,
      correo: empresa.correo,
      direccion: empresa.direccion,
      horarioAtencion: empresa.horarioAtencion,
      aceptaRetiro: empresa.aceptaRetiro,
      aceptaDelivery: empresa.aceptaDelivery,
      costoDelivery: Number(empresa.costoDelivery),
      montoMinimoDelivery: Number(empresa.montoMinimoDelivery),
      tiempoPreparacionMin: empresa.tiempoPreparacionMin,
    };
  }

  async obtenerMenu(slug: string) {
    await this.obtenerEmpresa(slug);

    // TODO multi-tenant: filtrar por empresaId cuando categorías y productos lo tengan
    const categorias = await this.prisma.categoria.findMany({
      where: { estado: 'A' },
      orderBy: { orden: 'asc' },
    });
    const productos = await this.prisma.producto.findMany({
      where: { estado: 'A', visibleOnline: true },
      orderBy: { orden: 'asc' },
    });

    return categorias
      .map(cat => ({
        ids: cat.ids,
        id: cat.id,
        nombre: cat.nombre,
        icono: cat.icono,
        productos: productos
          .filter(p => p.categoriaId === cat.id)
          .map(p => ({
            ids: p.ids,
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: Number(p.precio),
            imagen: p.imagen,
          })),
      }))
      .filter(cat => cat.productos.length > 0);
  }

  async obtenerComunas() {
    const comunas = await this.prisma.comuna.findMany({ orderBy: { descripcion: 'asc' } });
    return comunas.map(c => ({ id: c.id_comuna, nombre: c.descripcion }));
  }

  // --- PEDIDOS ---

  async crearPedido(slug: string, dto: CrearPedidoVitrinaRequest) {
    const empresa = await this.obtenerEmpresa(slug);
    const esDelivery = dto.tipoPedido === 'DELIVERY';

    if (esDelivery && !empresa.aceptaDelivery) {
      throw new BadRequestException('Este restaurante no está aceptando pedidos con delivery');
    }
    if (!esDelivery && !empresa.aceptaRetiro) {
      throw new BadRequestException('Este restaurante no está aceptando pedidos para retiro');
    }
    if (esDelivery && !dto.direccion) {
      throw new BadRequestException('La dirección de despacho es obligatoria para delivery');
    }

    // Los precios siempre se toman de la BD, nunca del navegador
    const productoIds = [...new Set(dto.items.map(i => i.productoId))];
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, estado: 'A', visibleOnline: true },
    });
    const prodMap = new Map(productos.map(p => [p.id, p]));
    const faltantes = productoIds.filter(id => !prodMap.has(id));
    if (faltantes.length > 0) {
      throw new BadRequestException('Uno o más productos ya no están disponibles. Actualiza tu carrito.');
    }

    const items = dto.items.map(i => {
      const producto = prodMap.get(i.productoId)!;
      const precioUnitario = Number(producto.precio);
      return { ...i, producto, precioUnitario, precioTotal: precioUnitario * i.cantidad };
    });

    const totalProductos = items.reduce((acc, i) => acc + i.precioTotal, 0);
    if (esDelivery && totalProductos < Number(empresa.montoMinimoDelivery)) {
      throw new BadRequestException('El pedido no alcanza el monto mínimo para delivery');
    }

    // Los precios publicados incluyen IVA: se desglosa en vez de sumarse
    const costoDelivery = esDelivery ? Number(empresa.costoDelivery) : 0;
    const total = Math.round(totalProductos + costoDelivery);
    const factorIva = 1 + Number(empresa.porcentajeImpuesto) / 100;
    const subtotal = Math.round(total / factorIva);
    const impuestos = total - subtotal;

    const direccionTexto = esDelivery && dto.direccion
      ? await this.formatearDireccion(dto.direccion)
      : null;

    const pedido = await this.prisma.$transaction(async tx => {
      const cliente = await this.registrarCliente(tx, empresa.id, dto);

      if (esDelivery && dto.direccion) {
        await tx.direccionCliente.create({
          data: {
            clienteId: cliente.id,
            comunaId: dto.direccion.comunaId ?? null,
            calle: dto.direccion.calle,
            numero: dto.direccion.numero,
            depto: dto.direccion.depto || null,
            referencia: dto.direccion.referencia || null,
          },
        });
      }

      const nuevoPedido = await tx.pedido.create({
        data: {
          tipoPedido: dto.tipoPedido,
          estado: EstadoPedido.INGRESADO,
          canal: 'ONLINE',
          estadoPago: 'PENDIENTE',
          empresaId: empresa.id,
          clienteId: cliente.id,
          nombreCliente: [dto.cliente.nombre, dto.cliente.apellido].filter(Boolean).join(' '),
          telefonoCliente: dto.cliente.telefono,
          correoCliente: dto.cliente.correo,
          direccionEntrega: direccionTexto,
          notas: dto.notas || null,
          costoDelivery,
          subtotal,
          impuestos,
          total,
          codigoSeguimiento: randomBytes(9).toString('base64url'),
        },
      });

      await tx.itemPedido.createMany({
        data: items.map(i => ({
          pedidoId: nuevoPedido.id,
          productoId: i.productoId,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          precioTotal: i.precioTotal,
          areaPreparacion: i.producto.areaPreparacion,
          notas: i.notas || null,
        })),
      });

      return nuevoPedido;
    });

    return {
      numeroPedido: pedido.numeroPedido,
      codigoSeguimiento: pedido.codigoSeguimiento,
      total: Number(pedido.total),
    };
  }

  /** Crea o actualiza el cliente invitado (identificado por correo dentro de la empresa) */
  private async registrarCliente(tx: Prisma.TransactionClient, empresaId: string, dto: CrearPedidoVitrinaRequest) {
    const correo = dto.cliente.correo.trim().toLowerCase();
    const existente = await tx.cliente.findUnique({
      where: { empresaId_correo: { empresaId, correo } },
    });

    if (!existente) {
      return tx.cliente.create({
        data: {
          empresaId,
          correo,
          nombre: dto.cliente.nombre,
          apellido: dto.cliente.apellido || null,
          telefono: dto.cliente.telefono,
        },
      });
    }

    // Un cliente registrado (con clave) no se sobrescribe desde una compra como invitado
    if (existente.claveHash) return existente;

    return tx.cliente.update({
      where: { id: existente.id },
      data: {
        nombre: dto.cliente.nombre,
        apellido: dto.cliente.apellido || null,
        telefono: dto.cliente.telefono,
      },
    });
  }

  private async formatearDireccion(direccion: CrearPedidoVitrinaRequest['direccion']) {
    if (!direccion) return null;
    const comuna = direccion.comunaId
      ? await this.prisma.comuna.findUnique({ where: { id_comuna: direccion.comunaId } })
      : null;
    return [
      `${direccion.calle} ${direccion.numero}`,
      direccion.depto ? `Depto ${direccion.depto}` : null,
      comuna?.descripcion,
      direccion.referencia ? `(${direccion.referencia})` : null,
    ].filter(Boolean).join(', ');
  }

  async obtenerSeguimiento(slug: string, codigo: string) {
    const empresa = await this.obtenerEmpresa(slug);
    const pedido = await this.prisma.pedido.findFirst({
      where: { codigoSeguimiento: codigo, empresaId: empresa.id },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    const items = await this.prisma.itemPedido.findMany({ where: { pedidoId: pedido.id } });
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: items.map(i => i.productoId) } },
    });
    const prodMap = new Map(productos.map(p => [p.id, p]));

    return {
      numeroPedido: pedido.numeroPedido,
      codigoSeguimiento: pedido.codigoSeguimiento,
      tipoPedido: pedido.tipoPedido,
      estadoPago: pedido.estadoPago,
      pasoActual: this.obtenerPasoActual(pedido.estado, pedido.tipoPedido),
      pasos: await this.obtenerPasos(pedido.tipoPedido),
      nombreCliente: pedido.nombreCliente,
      direccionEntrega: pedido.direccionEntrega,
      notas: pedido.notas,
      subtotal: Number(pedido.subtotal),
      impuestos: Number(pedido.impuestos),
      costoDelivery: Number(pedido.costoDelivery),
      total: Number(pedido.total),
      creadoEn: pedido.creadoEn,
      tiempoPreparacionMin: empresa.tiempoPreparacionMin,
      items: items.map(i => ({
        nombre: prodMap.get(i.productoId)?.nombre ?? 'Producto',
        imagen: prodMap.get(i.productoId)?.imagen ?? null,
        cantidad: i.cantidad,
        precioUnitario: Number(i.precioUnitario),
        precioTotal: Number(i.precioTotal),
        notas: i.notas,
      })),
    };
  }

  /** Traduce el estado interno del pedido al paso que ve el cliente */
  private obtenerPasoActual(estado: EstadoPedido, tipoPedido: string): string {
    switch (estado) {
      case EstadoPedido.INGRESADO:
      case EstadoPedido.PENDIENTE:
        return 'INGRESADO';
      case EstadoPedido.EN_COCINA:
      case EstadoPedido.RETRASADO:
        return 'EN_COCINA';
      case EstadoPedido.LISTO:
      case EstadoPedido.LISTO_RETIRO:
      case EstadoPedido.LISTO_ENVIO:
      case EstadoPedido.LISTO_MESA:
        return tipoPedido === 'DELIVERY' ? 'LISTO_ENVIO' : 'LISTO_RETIRO';
      case EstadoPedido.EN_CAMINO:
        return 'EN_CAMINO';
      case EstadoPedido.CANCELADO:
        return 'CANCELADO';
      default:
        return 'ENTREGADO';
    }
  }

  private async obtenerPasos(tipoPedido: string) {
    try {
      const estados = await this.prisma.estadoPedidoConfig.findMany({
        where: { estado: 'A', esAlerta: false, canal: { in: [tipoPedido, 'TODOS'] } },
        orderBy: [{ paso: 'asc' }, { ids: 'asc' }],
      });
      if (estados.length > 0) {
        return estados.map(e => ({ codigo: e.codigo, nombre: e.nombre }));
      }
    } catch (error) {
      this.logger.warn(`No se pudieron leer los estados de pedido: ${error}`);
    }
    return PASOS_RESPALDO
      .filter(p => p.canal === tipoPedido || p.canal === 'TODOS')
      .map(p => ({ codigo: p.codigo, nombre: p.nombre }));
  }

  // --- PAGO WEBPAY ---

  async iniciarPago(slug: string, codigo: string, urlRetorno: string) {
    const empresa = await this.obtenerEmpresa(slug);
    const pedido = await this.prisma.pedido.findFirst({
      where: { codigoSeguimiento: codigo, empresaId: empresa.id },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    if (pedido.estadoPago === 'PAGADO') {
      throw new BadRequestException('Este pedido ya fue pagado');
    }
    if (pedido.estado === EstadoPedido.CANCELADO) {
      throw new BadRequestException('Este pedido fue cancelado');
    }

    const monto = Math.round(Number(pedido.total));
    // buy_order de Webpay: máximo 26 caracteres y único por intento
    const ordenCompra = `GS${pedido.numeroPedido}-${Date.now().toString(36)}`.slice(0, 26);

    const respuesta = await this.webpayService.crearTransaccion(ordenCompra, pedido.id, monto, urlRetorno);

    await this.prisma.transaccionPago.create({
      data: {
        empresaId: empresa.id,
        pedidoId: pedido.id,
        pasarela: 'WEBPAY',
        ordenCompra,
        token: respuesta.token,
        monto,
      },
    });

    return { url: respuesta.url, token: respuesta.token };
  }

  /**
   * Procesa el retorno desde Webpay y devuelve la ruta de la vitrina a la que se redirige al cliente.
   * Casos: token_ws = pago normal; TBK_TOKEN = cliente anuló; solo TBK_ORDEN_COMPRA = tiempo agotado.
   */
  async procesarRetornoWebpay(parametros: Record<string, string | undefined>): Promise<string> {
    const { token_ws: tokenWs, TBK_TOKEN: tbkToken, TBK_ORDEN_COMPRA: tbkOrdenCompra } = parametros;

    const transaccion = await this.prisma.transaccionPago.findFirst({
      where: tokenWs && !tbkToken
        ? { token: tokenWs }
        : { OR: [{ token: tbkToken ?? '' }, { ordenCompra: tbkOrdenCompra ?? '' }] },
      include: { pedido: { include: { empresa: true } } },
    });
    if (!transaccion) {
      this.logger.warn(`Retorno Webpay sin transacción asociada: ${JSON.stringify(parametros)}`);
      return '/';
    }

    const { pedido } = transaccion;
    const rutaPedido = `/${pedido.empresa?.slug ?? ''}/pedido/${pedido.codigoSeguimiento}`;

    if (transaccion.estado !== 'INICIADA') {
      return `${rutaPedido}?pago=${transaccion.estado === 'AUTORIZADA' ? 'aprobado' : 'rechazado'}`;
    }

    // Anulado por el cliente o tiempo agotado: no se confirma la transacción
    if (!tokenWs || tbkToken) {
      await this.marcarRechazo(transaccion.id, pedido.id, 'ANULADA', parametros);
      return `${rutaPedido}?pago=anulado`;
    }

    let respuesta: any;
    try {
      respuesta = await this.webpayService.confirmarTransaccion(tokenWs);
    } catch (error) {
      this.logger.error(`Error al confirmar transacción Webpay ${transaccion.ordenCompra}: ${error}`);
      await this.marcarRechazo(transaccion.id, pedido.id, 'RECHAZADA', { error: String(error) });
      return `${rutaPedido}?pago=rechazado`;
    }

    const aprobada = respuesta?.response_code === 0 && respuesta?.status === 'AUTHORIZED';
    if (!aprobada) {
      await this.marcarRechazo(transaccion.id, pedido.id, 'RECHAZADA', respuesta);
      return `${rutaPedido}?pago=rechazado`;
    }

    await this.confirmarPagoAprobado(transaccion.id, pedido.id, respuesta);
    return `${rutaPedido}?pago=aprobado`;
  }

  private async marcarRechazo(transaccionId: string, pedidoId: string, estado: string, respuesta: unknown) {
    await this.prisma.$transaction([
      this.prisma.transaccionPago.update({
        where: { id: transaccionId },
        data: { estado, respuesta: JSON.stringify(respuesta) },
      }),
      this.prisma.pedido.update({
        where: { id: pedidoId },
        data: { estadoPago: 'RECHAZADO' },
      }),
    ]);
  }

  private async confirmarPagoAprobado(transaccionId: string, pedidoId: string, respuesta: any) {
    let metodo = await this.prisma.metodoPago.findFirst({ where: { codigo: 'WEBPAY' } });
    if (!metodo) {
      metodo = await this.prisma.metodoPago.create({ data: { nombre: 'Webpay', codigo: 'WEBPAY', estado: 'A' } });
    }

    const pedido = await this.prisma.$transaction(async tx => {
      await tx.transaccionPago.update({
        where: { id: transaccionId },
        data: {
          estado: 'AUTORIZADA',
          codigoAutorizacion: respuesta.authorization_code ?? null,
          tipoPago: respuesta.payment_type_code ?? null,
          cuotas: respuesta.installments_number ?? null,
          ultimosDigitos: respuesta.card_detail?.card_number ?? null,
          respuesta: JSON.stringify(respuesta),
        },
      });

      await tx.pago.create({
        data: {
          pedidoId,
          turnoId: null,
          monto: respuesta.amount,
          metodoPagoId: metodo!.id,
          numeroReferencia: respuesta.authorization_code ?? null,
        },
      });

      // Pagado: recién ahora el pedido entra a la cola de cocina
      return tx.pedido.update({
        where: { id: pedidoId },
        data: { estadoPago: 'PAGADO', estado: EstadoPedido.PENDIENTE },
      });
    });

    await this.notificarCocina(pedido);
  }

  /** Emite el pedido al KDS/POS con el mismo formato que usa OrdersService */
  private async notificarCocina(pedido: { id: string } & Record<string, any>) {
    const items = await this.prisma.itemPedido.findMany({ where: { pedidoId: pedido.id } });
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: items.map(i => i.productoId) } },
    });
    const prodMap = new Map(productos.map(p => [p.id, p]));

    this.eventsGateway.emitNuevoPedido({
      ...pedido,
      mesa: null,
      items: items.map(i => ({ ...i, producto: prodMap.get(i.productoId) || null })),
    });
  }
}
