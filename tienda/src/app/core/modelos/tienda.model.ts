export interface Empresa {
  ids: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  logoUrl: string | null;
  portadaUrl: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  horarioAtencion: string | null;
  aceptaRetiro: boolean;
  aceptaDelivery: boolean;
  costoDelivery: number;
  montoMinimoDelivery: number;
  tiempoPreparacionMin: number;
}

export interface Producto {
  ids: number;
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
}

export interface Categoria {
  ids: number;
  id: string;
  nombre: string;
  icono: string | null;
  productos: Producto[];
}

export interface Comuna {
  id: number;
  nombre: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  notas: string;
}

export type TipoPedido = 'PARA_LLEVAR' | 'DELIVERY';

export interface CrearPedidoRequest {
  tipoPedido: TipoPedido;
  cliente: { nombre: string; apellido?: string; correo: string; telefono: string };
  direccion?: { comunaId?: number; calle: string; numero: string; depto?: string; referencia?: string };
  notas?: string;
  items: { productoId: string; cantidad: number; notas?: string }[];
}

export interface CrearPedidoResponse {
  numeroPedido: number;
  codigoSeguimiento: string;
  total: number;
}

export interface IniciarPagoResponse {
  url: string;
  token: string;
}

export interface Seguimiento {
  numeroPedido: number;
  codigoSeguimiento: string;
  tipoPedido: TipoPedido;
  estadoPago: 'PENDIENTE' | 'PAGADO' | 'RECHAZADO' | null;
  pasoActual: string;
  pasos: { codigo: string; nombre: string }[];
  nombreCliente: string | null;
  direccionEntrega: string | null;
  notas: string | null;
  subtotal: number;
  impuestos: number;
  costoDelivery: number;
  total: number;
  creadoEn: string;
  tiempoPreparacionMin: number;
  items: { nombre: string; imagen: string | null; cantidad: number; precioUnitario: number; precioTotal: number; notas: string | null }[];
}
