import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { apiUrl } from '../../core/constants/api.constants';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, CustomSelectComponent, BadgeComponent],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.scss'
})
export class OrdenesComponent implements OnInit {
  private http = inject(HttpClient);
  
  pedidos: any[] = [];
  cargando = true;

  // Filtros de la grilla principal
  busquedaTexto: string = '';
  filtroEstado: string = 'TODOS';
  filtroCanal: string = 'TODOS';
  soloHoy: boolean = false; // Permite ver las órdenes creadas previas y de hoy

  opcionesEstado: SelectOption[] = [
    { value: 'TODOS', label: 'Todos los Estados' },
    { value: 'INGRESADO', label: 'Ingresado' },
    { value: 'EN_COCINA', label: 'En Cocina' },
    { value: 'LISTO_MESA', label: 'Listo para Mesa' },
    { value: 'LISTO_RETIRO', label: 'Listo para Retiro' },
    { value: 'LISTO_ENVIO', label: 'Listo para Envío' },
    { value: 'SERVIDO', label: 'Servido' },
    { value: 'EN_CAMINO', label: 'En Camino' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'PAGADO_CERRADO', label: 'Pagado y Cerrado' },
    { value: 'CANCELADO', label: 'Cancelado' },
    { value: 'RETRASADO', label: 'Retrasado' }
  ];

  opcionesCanal: SelectOption[] = [
    { value: 'TODOS', label: 'Todos los Canales' },
    { value: 'SALON', label: 'Para Servir (Salón)' },
    { value: 'PARA_LLEVAR', label: 'Para Llevar' },
    { value: 'DELIVERY', label: 'Delivery' }
  ];

  // Paginación de la grilla principal
  paginaActual: number = 1;
  itemsPorPagina: number = 8;

  // Modal de Detalles de Pedido
  mostrarModalDetalle: boolean = false;
  pedidoSeleccionado: any = null;

  // Modal de Historial Completo
  mostrarModalHistorial: boolean = false;
  busquedaHistorial: string = '';
  filtroPeriodoHistorial: string = '7_DIAS';
  filtroCanalHistorial: string = 'TODOS';
  filtroEstadoHistorial: string = 'TODOS';
  paginaHistorial: number = 1;
  itemsPorPaginaHistorial: number = 10;

  opcionesPeriodoHistorial: SelectOption[] = [
    { value: '7_DIAS', label: 'Últimos 7 días' },
    { value: 'ESTE_MES', label: 'Este Mes' },
    { value: '3_MESES', label: 'Últimos 3 meses' },
    { value: 'TODOS', label: 'Todos los Registros' }
  ];

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.http.get<any[]>(apiUrl('/api/pedidos')).subscribe({
      next: (data) => {
        this.pedidos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
        this.cargando = false;
      }
    });
  }

  // --- Validación de Fecha para Pedidos de Hoy ---
  esDeHoy(fechaStr: string): boolean {
    if (!fechaStr) return false;
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  }

  alternarSoloHoy() {
    this.soloHoy = !this.soloHoy;
    this.paginaActual = 1;
  }

  // --- Pedidos Filtrados de la Grilla Principal ---
  get pedidosDelDiaFiltrados(): any[] {
    return this.pedidos.filter(p => {
      // 1. Filtro de búsqueda (AND)
      const cumpleBusqueda = !this.busquedaTexto.trim() || 
        p.numeroPedido?.toString().includes(this.busquedaTexto) ||
        p.mesa?.numeroMesa?.toLowerCase().includes(this.busquedaTexto.toLowerCase()) ||
        p.nombreCliente?.toLowerCase().includes(this.busquedaTexto.toLowerCase());
      // 2. Filtro de estado (AND)
      const cumpleEstado = this.filtroEstado === 'TODOS' || p.estado === this.filtroEstado;
      // 3. Filtro de canal (AND)
      const cumpleCanal = this.filtroCanal === 'TODOS' || p.tipoPedido === this.filtroCanal;

      return cumpleBusqueda && cumpleEstado && cumpleCanal;
    });
  }

  // Paginación para grilla principal
  get pedidosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.pedidosDelDiaFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.pedidosDelDiaFiltrados.length / this.itemsPorPagina) || 1;
  }

  get indiceInicio(): number {
    if (this.pedidosDelDiaFiltrados.length === 0) return 0;
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  get indiceFin(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.pedidosDelDiaFiltrados.length);
  }

  cambiarPagina(delta: number) {
    const nueva = this.paginaActual + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas) {
      this.paginaActual = nueva;
    }
  }

  // --- Contadores de las Tarjetas Superiores ---
  getNuevas() { 
    return this.pedidos.filter(p => p.estado === 'INGRESADO' || p.estado === 'PENDIENTE').length; 
  }
  getPreparando() { 
    return this.pedidos.filter(p => p.estado === 'EN_COCINA').length; 
  }
  getListas() { 
    return this.pedidos.filter(p => p.estado === 'LISTO' || p.estado === 'LISTO_MESA' || p.estado === 'LISTO_RETIRO' || p.estado === 'LISTO_ENVIO').length; 
  }
  getEntregadas() { 
    return this.pedidos.filter(p => (p.estado === 'ENTREGADO' || p.estado === 'PAGADO' || p.estado === 'PAGADO_CERRADO' || p.estado === 'SERVIDO')).length; 
  }

  // --- Formateador de Moneda Chilena (CLP sin decimales, punto de miles) ---
  formatearCLP(monto: number | string | null | undefined): string {
    if (monto === null || monto === undefined || monto === '' || isNaN(Number(monto))) return '$0';
    const num = Math.round(Number(monto));
    const enteroConPuntos = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${enteroConPuntos}`;
  }

  // --- Formateador de Etiqueta de Estado ---
  obtenerEtiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      INGRESADO: 'Ingresado',
      PENDIENTE: 'Ingresado',
      EN_COCINA: 'En Cocina',
      LISTO_MESA: 'Listo Mesa',
      LISTO: 'Listo Mesa',
      LISTO_RETIRO: 'Listo Retiro',
      LISTO_ENVIO: 'Listo Envío',
      SERVIDO: 'Servido',
      EN_CAMINO: 'En Camino',
      ENTREGADO: 'Entregado',
      PAGADO_CERRADO: 'Pagado y Cerrado',
      PAGADO: 'Pagado y Cerrado',
      CANCELADO: 'Cancelado',
      RETRASADO: 'Retrasado'
    };
    return mapa[estado] || estado;
  }

  // --- Cálculo Reactivo de Tiempo Relativo ---
  calcularTiempoRelativo(fechaStr: string): string {
    if (!fechaStr) return 'Hace un momento';
    const ahora = Date.now();
    const fecha = new Date(fechaStr).getTime();
    const diffSeg = Math.floor((ahora - fecha) / 1000);

    if (diffSeg < 60) return 'Hace un momento';
    const diffMin = Math.floor(diffSeg / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias === 1) return 'Ayer';
    return `Hace ${diffDias} días`;
  }

  // --- Helpers Modal de Detalles ---
  verDetalles(pedido: any) {
    this.pedidoSeleccionado = pedido;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.pedidoSeleccionado = null;
  }

  obtenerAtendidoEn(pedido: any): string {
    if (!pedido) return 'Caja Principal';
    if (pedido.tipoPedido === 'DELIVERY') return 'Canal Online / Web';
    if (pedido.origen === 'WEB' || pedido.esOnline) return 'Venta Online / Web';
    if (pedido.caja) return pedido.caja;
    return 'Caja Principal';
  }

  obtenerAtendidoPor(pedido: any): string {
    if (!pedido) return 'Cajero en Turno';
    if (pedido.mesero) {
      return `${pedido.mesero.nombre} ${pedido.mesero.apellidoPaterno || ''}`.trim();
    }
    if (pedido.tipoPedido === 'DELIVERY' || pedido.origen === 'WEB') {
      return pedido.nombreCliente || 'Usuario Web Registrado';
    }
    const usuarioActual = this.getUsuarioActual();
    if (usuarioActual?.nombre) {
      return `${usuarioActual.nombre} ${usuarioActual.apellidoPaterno || ''}`.trim();
    }
    return 'Cajero Principal';
  }

  getUsuarioActual(): any {
    try {
      const u = localStorage.getItem('usuario');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  // --- Modal de Historial Completo ---
  abrirModalHistorial() {
    this.mostrarModalHistorial = true;
    this.paginaHistorial = 1;
  }

  cerrarModalHistorial() {
    this.mostrarModalHistorial = false;
  }

  get pedidosHistorialFiltrados(): any[] {
    const ahora = new Date();
    return this.pedidos.filter(p => {
      const fecha = new Date(p.creadoEn);

      // Filtro de periodo solicitado (Item 7: 7 días, este mes, 3 meses, todos)
      let cumplePeriodo = true;
      if (this.filtroPeriodoHistorial === '7_DIAS') {
        const hace7Dias = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));
        cumplePeriodo = fecha >= hace7Dias;
      } else if (this.filtroPeriodoHistorial === 'ESTE_MES') {
        cumplePeriodo = fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      } else if (this.filtroPeriodoHistorial === '3_MESES') {
        const hace3Meses = new Date(ahora);
        hace3Meses.setMonth(hace3Meses.getMonth() - 3);
        cumplePeriodo = fecha >= hace3Meses;
      } else if (this.filtroPeriodoHistorial === 'TODOS') {
        cumplePeriodo = true;
      }

      // Filtro de búsqueda (AND)
      const cumpleBusqueda = !this.busquedaHistorial.trim() ||
        p.numeroPedido?.toString().includes(this.busquedaHistorial) ||
        p.mesa?.numeroMesa?.toLowerCase().includes(this.busquedaHistorial.toLowerCase()) ||
        p.nombreCliente?.toLowerCase().includes(this.busquedaHistorial.toLowerCase());

      // Filtro de canal (AND)
      const cumpleCanal = this.filtroCanalHistorial === 'TODOS' || p.tipoPedido === this.filtroCanalHistorial;

      // Filtro de estado (AND)
      const cumpleEstado = this.filtroEstadoHistorial === 'TODOS' || p.estado === this.filtroEstadoHistorial;

      return cumplePeriodo && cumpleBusqueda && cumpleCanal && cumpleEstado;
    });
  }

  get pedidosHistorialPaginados(): any[] {
    const inicio = (this.paginaHistorial - 1) * this.itemsPorPaginaHistorial;
    return this.pedidosHistorialFiltrados.slice(inicio, inicio + this.itemsPorPaginaHistorial);
  }

  get totalPaginasHistorial(): number {
    return Math.ceil(this.pedidosHistorialFiltrados.length / this.itemsPorPaginaHistorial) || 1;
  }

  get indiceInicioHistorial(): number {
    if (this.pedidosHistorialFiltrados.length === 0) return 0;
    return (this.paginaHistorial - 1) * this.itemsPorPaginaHistorial + 1;
  }

  get indiceFinHistorial(): number {
    return Math.min(this.paginaHistorial * this.itemsPorPaginaHistorial, this.pedidosHistorialFiltrados.length);
  }

  cambiarPaginaHistorial(delta: number) {
    const nueva = this.paginaHistorial + delta;
    if (nueva >= 1 && nueva <= this.totalPaginasHistorial) {
      this.paginaHistorial = nueva;
    }
  }
}
