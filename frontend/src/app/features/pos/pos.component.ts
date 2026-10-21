import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenúuService, Producto, Categoria } from '../../core/services/menu.service';
import { PedidoService, PedidoDTO } from '../../core/services/pedido.service';
import { PagoService, MetodoPago } from '../../core/services/pago.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';
import { AlertModalComponent } from '../../shared/components/alert-modal/alert-modal.component';
import { apiUrl, resolverUrlImagen } from '../../core/constants/api.constants';

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface MesaTimer {
  horaInicio: number;
  minutos: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent, AlertModalComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit, OnDestroy {
  private menuService = inject(MenúuService);
  private pedidoService = inject(PedidoService);
  private pagoService = inject(PagoService);
  private http = inject(HttpClient);

  resolverUrl(url?: string | null): string {
    return resolverUrlImagen(url);
  }

  manejarErrorImagen(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop';
    }
  }

  categorias: Categoria[] = [];
  productosMostrados: Producto[] = [];
  categoriaSeleccionada: string = 'TODAS';
  busquedaTexto: string = '';
  
  carrito: CartItem[] = [];
  
  subtotal: number = 0;
  impuestos: number = 0;
  total: number = 0;
  porcentajeImpuesto: number = 0.19;

  cargando: boolean = false;
  
  // Por defecto 'PARA_LLEVAR' y con 'Para Llevar' primero en las opciones
  tipoPedido: 'PARA_LLEVAR' | 'SALON' | 'DELIVERY' = 'PARA_LLEVAR';
  opcionesTipoPedido: SelectOption[] = [
    { value: 'PARA_LLEVAR', label: 'Para Llevar' },
    { value: 'SALON', label: 'Para Servir' },
    { value: 'DELIVERY', label: 'Delivery' }
  ];
  
  vistaActual: 'GRID' | 'LIST' = 'GRID';
  
  // Salones y Mesas
  salonSeleccionado: string = 'TODOS';
  areas: any[] = [];
  opcionesSalones: SelectOption[] = [{ value: 'TODOS', label: 'Ver todos' }];
  todasLasMesas: any[] = [];
  mesasMostradas: any[] = [];
  mesaSeleccionadaId: string | null = null;
  mesaSeleccionadaObj: any = null;

  // Cronómetro de espera para mesas en salón
  mesasConTiempo: { [mesaId: string]: MesaTimer } = {};
  private timerInterval: any = null;

  // Modales y Notificaciones del UI Kit (Cero alerts nativos)
  alertaVisible: boolean = false;
  alertaTitulo: string = '';
  alertaMensaje: string = '';
  alertaTipo: 'success' | 'error' = 'error';
  alertaBoton: string = 'Entendido';

  mostrarModalCocinaExito: boolean = false;
  infoPedidoCocina: any = null;

  mostrarModalCobro: boolean = false;
  metodosPago: MetodoPago[] = [];
  pedidoACobrar: any = null;
  metodoPagoSeleccionadoId: string = '';
  montoRecibido: any = 0;
  vueltoCalculado: number = 0;
  referenciaPago: string = '';
  procesandoPago: boolean = false;
  pagoExitoso: boolean = false;
  comprobantePago: any = null;

  // Pedido pendiente de cobro para recuperación en caso de cierre accidental
  pedidoPendienteCobro: any = null;

  // Filtro de mesas por leyenda
  filtroEstadoMesa: string = 'TODOS';

  // Propina Sugerida (10% en Chile - Por defecto siempre activa según regla de negocio)
  incluirPropina: boolean = true;
  propinaSugerida: number = 0;
  mensajeExitoPOS: string = '';

  get totalConPropina(): number {
    if (!this.pedidoACobrar) return 0;
    const base = Math.round(Number(this.pedidoACobrar.total)) || 0;
    return this.incluirPropina ? Math.round(base + this.propinaSugerida) : base;
  }

  togglePropina() {
    this.incluirPropina = !this.incluirPropina;
    this.montoRecibido = this.totalConPropina;
    this.calcularVuelto();
  }

  parsearMontoChileno(valor: any): number {
    if (valor === null || valor === undefined || valor === '') return 0;
    if (typeof valor === 'number') return isNaN(valor) ? 0 : Math.round(valor);
    
    const str = String(valor).trim().replace(/\$/g, '').replace(/\s+/g, '');
    if (!str) return 0;

    // En Chile los pesos son enteros sin decimales. Si se ingresaron puntos o comas de miles, se limpian:
    const soloDigitos = str.replace(/[.,]/g, '');
    return Math.round(Number(soloDigitos)) || 0;
  }

  onMontoRecibidoChange(valor: any) {
    this.montoRecibido = valor;
    this.calcularVuelto();
  }

  formatearCLP(monto: number | string | null | undefined): string {
    if (monto === null || monto === undefined || monto === '' || isNaN(Number(monto))) return '$0';
    const num = Math.round(Number(monto));
    const enteroConPuntos = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${enteroConPuntos}`;
  }

  cambiarMesa() {
    this.mesaSeleccionadaId = null;
    this.mesaSeleccionadaObj = null;
  }

  setFiltroEstado(estado: string) {
    if (this.filtroEstadoMesa === estado) {
      this.filtroEstadoMesa = 'TODOS';
    } else {
      this.filtroEstadoMesa = estado;
    }
    this.filtrarMesas();
  }

  reabrirCobroPendiente() {
    if (this.pedidoPendienteCobro) {
      this.pedidoACobrar = { ...this.pedidoPendienteCobro };
      this.propinaSugerida = Math.round(Number(this.pedidoACobrar.total) * 0.10 * 100) / 100;
      this.incluirPropina = true;
      this.montoRecibido = this.totalConPropina;
      this.calcularVuelto();
      this.pagoExitoso = false;
      this.comprobantePago = null;
      this.mostrarModalCobro = true;
    }
  }

  descartarCobroPendiente() {
    this.pedidoPendienteCobro = null;
  }

  ngOnInit(): void {
    this.cargarCatalogo();
    this.cargarAreasYMesas();
    this.cargarMetodosPago();
    this.iniciarIntervaloCronometro();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  mostrarAlerta(titulo: string, mensaje: string, tipo: 'success' | 'error' = 'error', boton: string = 'Entendido') {
    this.alertaTitulo = titulo;
    this.alertaMensaje = mensaje;
    this.alertaTipo = tipo;
    this.alertaBoton = boton;
    this.alertaVisible = true;
  }

  cerrarAlerta() {
    this.alertaVisible = false;
  }

  iniciarIntervaloCronometro() {
    this.timerInterval = setInterval(() => {
      const ahora = Date.now();
      for (const mesaId in this.mesasConTiempo) {
        const item = this.mesasConTiempo[mesaId];
        item.minutos = Math.floor((ahora - item.horaInicio) / 60000);
      }
    }, 15000);
  }

  cargarMetodosPago() {
    this.pagoService.obtenerMetodosPago().subscribe({
      next: (metodos) => {
        this.metodosPago = metodos;
        if (metodos.length > 0) {
          this.metodoPagoSeleccionadoId = metodos[0].id;
        }
      },
      error: (err) => console.error('Error cargando métodos de pago', err)
    });
  }

  cargarAreasYMesas() {
    this.http.get<any[]>(apiUrl('/api/salon/areas')).subscribe(res => {
      this.areas = res;
      this.opcionesSalones = [
        { value: 'TODOS', label: 'Ver todos' },
        ...res.map(a => ({ value: a.id, label: a.nombre }))
      ];
    });

    this.http.get<any[]>(apiUrl('/api/salon/mesas')).subscribe(res => {
      this.todasLasMesas = res;
      this.filtrarMesas();
    });
  }

  filtrarMesas() {
    let mesas = this.todasLasMesas;
    if (this.salonSeleccionado !== 'TODOS') {
      mesas = mesas.filter(m => m.areaSalonId === this.salonSeleccionado);
    }
    if (this.filtroEstadoMesa !== 'TODOS') {
      mesas = mesas.filter(m => m.estado === this.filtroEstadoMesa);
    }
    this.mesasMostradas = mesas;
  }

  cambiarSalon(event: any) {
    this.filtrarMesas();
  }

  seleccionarMesa(mesa: any) {
    // Permite seleccionar la mesa directamente (Item 6)
    this.mesaSeleccionadaId = mesa.id;
    this.mesaSeleccionadaObj = mesa;
    this.tipoPedido = 'SALON';
  }

  getEstadoConfig(estado: string) {
    switch (estado) {
      case 'D': return { bg: '#D96B27', text: '#ffffff', label: 'Libre' };
      case 'O': return { bg: '#5E8237', text: '#ffffff', label: 'Ocupada' };
      case 'CS': return { bg: '#A33129', text: '#ffffff', label: 'Cuenta Solicitada' };
      case 'R': return { bg: '#8A6E85', text: '#ffffff', label: 'Reservada' };
      case 'L': return { bg: '#C47D2B', text: '#ffffff', label: 'Limpieza' };
      case 'EM': return { bg: '#4A545C', text: '#ffffff', label: 'Mantenimiento' };
      default: return { bg: '#D96B27', text: '#ffffff', label: 'Libre' };
    }
  }

  cargarCatalogo() {
    this.cargando = true;
    this.menuService.obtenerCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats;
        this.filtrarProductos('TODAS');
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando catálogo', err);
        this.cargando = false;
      }
    });
  }

  filtrarProductos(catId: string) {
    this.categoriaSeleccionada = catId;
    let list: Producto[] = [];
    if (catId === 'TODAS') {
      list = this.categorias.reduce((acc, cat) => acc.concat(cat.productos || []), [] as Producto[]);
    } else {
      const cat = this.categorias.find(c => c.id === catId);
      list = cat?.productos || [];
    }

    if (this.busquedaTexto.trim()) {
      const busq = this.busquedaTexto.toLowerCase();
      list = list.filter(p => p.nombre.toLowerCase().includes(busq) || (p.descripcion && p.descripcion.toLowerCase().includes(busq)));
    }

    this.productosMostrados = list;
  }

  buscarProductos(texto: string) {
    this.busquedaTexto = texto;
    this.filtrarProductos(this.categoriaSeleccionada);
  }

  cambiarVista(vista: 'GRID' | 'LIST') {
    this.vistaActual = vista;
  }

  agregarAlCarrito(prod: Producto) {
    const existe = this.carrito.find(item => item.producto.id === prod.id);
    if (existe) {
      existe.cantidad++;
    } else {
      this.carrito.push({ producto: prod, cantidad: 1 });
    }
    this.calcularTotales();
  }

  cambiarCantidad(index: number, delta: number) {
    this.carrito[index].cantidad += delta;
    if (this.carrito[index].cantidad <= 0) {
      this.carrito.splice(index, 1);
    }
    this.calcularTotales();
  }

  limpiarCarrito() {
    this.carrito = [];
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = Math.round(this.carrito.reduce((acc, item) => acc + (Number(item.producto.precio) * item.cantidad), 0));
    this.impuestos = Math.round(this.subtotal * this.porcentajeImpuesto);
    this.total = this.subtotal + this.impuestos;
  }

  enviarPedido() {
    if (this.carrito.length === 0) {
      this.mostrarAlerta(
        'Comanda Vacía',
        'Debes agregar al menos un producto a la comanda antes de enviarla a cocina.',
        'error',
        'Entendido'
      );
      return;
    }

    // Regla estricta: Si es Para Servir, DEBE seleccionarse obligatoriamente la mesa (Item 5)
    if (this.tipoPedido === 'SALON' && !this.mesaSeleccionadaId) {
      this.mostrarAlerta(
        'Mesa Requerida',
        'Para pedidos "Para Servir", debes seleccionar obligatoriamente una mesa disponible haciendo clic sobre ella en Zonas para Servir.',
        'error',
        'Seleccionar Mesa'
      );
      return;
    }

    this.cargando = true;
    
    const items = this.carrito.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
      precioUnitario: Number(item.producto.precio),
      precioTotal: Number(item.producto.precio) * item.cantidad,
      areaPreparacion: item.producto.areaPreparacion
    }));

    const usuarioActual = this.getUsuarioActual();
    const pedidoData: PedidoDTO = {
      tipoPedido: this.tipoPedido,
      subtotal: this.subtotal,
      impuestos: this.impuestos,
      total: this.total,
      mesaId: this.tipoPedido === 'SALON' ? this.mesaSeleccionadaId : undefined,
      meseroId: usuarioActual?.id || undefined,
      items: items
    };

    const carritoActualParaResumen = [...this.carrito];
    const totalActualParaResumen = this.total;
    const subtotalActualParaResumen = this.subtotal;
    const impuestosActualParaResumen = this.impuestos;
    const mesaIdAsignada = this.mesaSeleccionadaId;
    const mesaObjAsignada = this.mesaSeleccionadaObj;
    const tipo = this.tipoPedido;

    this.pedidoService.crearPedido(pedidoData).subscribe({
      next: (res) => {
        this.cargando = false;
        this.carrito = [];
        this.calcularTotales();

        if (tipo === 'SALON') {
          // Caso Salon: Mensaje estético oficial e inicio del contador de tiempo (Item 4)
          if (mesaIdAsignada) {
            this.mesasConTiempo[mesaIdAsignada] = {
              horaInicio: Date.now(),
              minutos: 0
            };
            const mesaEncontrada = this.todasLasMesas.find(m => m.id === mesaIdAsignada);
            if (mesaEncontrada) {
              mesaEncontrada.estado = 'O';
            }
            this.filtrarMesas();
          }

          this.infoPedidoCocina = {
            pedido: res,
            mesa: mesaObjAsignada,
            tipo: 'SALON',
            items: carritoActualParaResumen,
            total: totalActualParaResumen
          };
          this.mostrarModalCocinaExito = true;
          this.mesaSeleccionadaId = null;
          this.mesaSeleccionadaObj = null;

        } else {
          // Caso Para Llevar o Delivery: Despliegue inmediato del modal de cobro y backend de pagos
          const propina = Math.round(Number(totalActualParaResumen) * 0.10);
          this.propinaSugerida = propina;
          this.incluirPropina = true; // Por defecto siempre activa (Item 7)
          this.pedidoACobrar = {
            id: res.id,
            ids: res.ids || res.id?.substring(0, 6),
            tipoPedido: tipo,
            subtotal: subtotalActualParaResumen,
            impuestos: impuestosActualParaResumen,
            total: totalActualParaResumen,
            items: carritoActualParaResumen
          };
          this.montoRecibido = this.totalConPropina;
          this.calcularVuelto();
          this.pagoExitoso = false;
          this.comprobantePago = null;
          this.mostrarModalCobro = true;
        }
      },
      error: (err) => {
        console.error('Error enviando pedido', err);
        this.cargando = false;
        this.mostrarAlerta(
          'Error al Procesar',
          'Ocurrió un error al intentar enviar el pedido. Por favor intenta nuevamente.',
          'error'
        );
      }
    });
  }

  cerrarModalCocina() {
    this.mostrarModalCocinaExito = false;
    this.infoPedidoCocina = null;
  }

  // --- Cobro / Pagos ---
  seleccionarMetodoPago(metodoId: string) {
    this.metodoPagoSeleccionadoId = metodoId;
    this.calcularVuelto();
  }

  establecerMontoRecibido(monto: number) {
    this.montoRecibido = monto;
    this.calcularVuelto();
  }

  calcularVuelto() {
    if (this.pedidoACobrar) {
      const totalEsperado = Math.round(Number(this.totalConPropina)) || 0;
      const recibido = this.parsearMontoChileno(this.montoRecibido);
      const v = Math.round(recibido - totalEsperado);
      this.vueltoCalculado = v > 0 ? v : 0;
    } else {
      this.vueltoCalculado = 0;
    }
  }

  confirmarCobro() {
    if (!this.pedidoACobrar || this.procesandoPago) return;

    const totalACobrar = this.totalConPropina;
    const recibidoNum = this.parsearMontoChileno(this.montoRecibido);
    if (recibidoNum < totalACobrar) {
      this.mostrarAlerta(
        'Monto Insuficiente',
        `El monto recibido (${this.formatearCLP(recibidoNum)}) no puede ser menor al total a cobrar (${this.formatearCLP(totalACobrar)}).`,
        'error',
        'Revisar Monto'
      );
      return;
    }

    this.procesandoPago = true;

    this.pagoService.registrarPago({
      pedidoId: this.pedidoACobrar.id,
      monto: Number(totalACobrar),
      metodoPagoId: this.metodoPagoSeleccionadoId,
      numeroReferencia: this.referenciaPago || undefined
    }).subscribe({
      next: (res) => {
        this.procesandoPago = false;
        this.pagoExitoso = true;
        this.comprobantePago = res;
        this.pedidoPendienteCobro = null;
      },
      error: (err) => {
        console.error('Error al registrar pago', err);
        this.procesandoPago = false;
        this.mostrarAlerta(
          'Error en el Pago',
          err.error?.message || 'No fue posible registrar el pago en caja.',
          'error'
        );
      }
    });
  }

  cerrarModalCobro() {
    if (this.pagoExitoso && this.pedidoACobrar) {
      this.mensajeExitoPOS = `¡Cobro de Comanda #${this.pedidoACobrar.ids} completado con éxito!`;
      setTimeout(() => this.mensajeExitoPOS = '', 5000);
      this.pedidoPendienteCobro = null;
    } else if (this.pedidoACobrar && !this.pagoExitoso) {
      // Si se cierra antes de cobrar o se hace clic en "Cobrar Más Tarde"
      this.pedidoPendienteCobro = { ...this.pedidoACobrar };
      this.mensajeExitoPOS = `Pedido #${this.pedidoACobrar.ids} guardado como pendiente de cobro. Puedes reabrir el pago en cualquier momento.`;
      setTimeout(() => this.mensajeExitoPOS = '', 7000);
    }
    this.mostrarModalCobro = false;
    this.pedidoACobrar = null;
    this.pagoExitoso = false;
    this.comprobantePago = null;
    this.referenciaPago = '';
  }

  getUsuarioActual(): any {
    try {
      const u = localStorage.getItem('usuario');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }
}
