import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalonService, AreaSalon, Mesa } from '../../core/services/salon.service';
import { MenúuService, Categoria, Producto } from '../../core/services/menu.service';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';

export interface VentaBarra {
  id: string;
  ids: number;
  codigo: string;
  hora: string;
  items: string;
  monto: number;
  estado: 'abierta' | 'cerrada';
  cliente?: string;
}

export interface ItemComanda {
  id: string;
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string;
}

export interface MesaPlano {
  id: string;
  ids: number;
  numeroMesa: string;
  capacidad: number;
  estado: string;
  shape: 'barra' | 'cuadrada' | 'redonda' | 'rectangular';
  monto: number;
  totalVentasDia?: number;
  ventasAbiertasDia?: VentaBarra[];
  itemsComanda?: ItemComanda[];
  config: { bg: string; isPasive: boolean; label: string; icono: string };
  tieneCuentaActiva: boolean;
}

export interface FilaPlano {
  numeroFila: number;
  mesaIzq: MesaPlano;
  mesaCentro: MesaPlano;
  mesaDer: MesaPlano;
}

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss'
})
export class MesasComponent implements OnInit {
  public zonas = signal<AreaSalon[]>([
    { id: 'salon-principal', ids: 1, nombre: 'Salón Principal', orden: 1 },
    { id: 'terraza-vip', ids: 2, nombre: 'Terraza VIP', orden: 2 }
  ]);
  public zonaActivaId = signal<number>(1);
  public mesasOtrasZonas = signal<any[]>([]);

  // Selector oficial de salones del UI Kit (con primera opción deshabilitada según regla)
  public opcionesZonas = computed<SelectOption[]>(() => {
    return [
      { value: null, label: 'Seleccionar Salón...', disabled: true },
      ...this.zonas().map(z => ({ value: z.ids, label: z.nombre }))
    ];
  });

  // Estados de interfaz
  public showCapa2 = false;
  public showCapa3 = false;
  public mesaActiva: MesaPlano | null = null;

  // Toma de pedidos en la vista
  public modoTomarPedido = signal<boolean>(false);
  public categoriaActivaId = signal<string>('todas');
  public pedidoBorrador = signal<ItemComanda[]>([]);
  public catalogoCategorias = signal<Categoria[]>([]);

  public subtotalBorrador = computed(() => {
    return this.pedidoBorrador().reduce((acc, it) => acc + (it.precio * it.cantidad), 0);
  });

  public productosDisponibles = computed(() => {
    const cats = this.catalogoCategorias();
    const catId = this.categoriaActivaId();
    if (catId === 'todas') {
      return cats.flatMap(c => c.productos || []);
    }
    const encontrada = cats.find(c => c.id === catId);
    return encontrada ? encontrada.productos || [] : [];
  });

  // Leyenda de estados
  public estadosLeyenda = [
    { codigo: 'D', nombre: 'Disponible', color: '#D96B27' },
    { codigo: 'O', nombre: 'Ocupada', color: '#5E8237' },
    { codigo: 'CS', nombre: 'Cta. Solicitada', color: '#A33129' },
    { codigo: 'R', nombre: 'Reservada', color: '#8A6E85' },
    { codigo: 'L', nombre: 'Limpieza', color: '#C47D2B' },
    { codigo: 'EM', nombre: 'Mantenimiento', color: '#4A545C' }
  ];

  // Mesa Barra Central Superior con ventas abiertas e historial del día
  public mesaBarra: MesaPlano = {
    id: 'sp-barra',
    ids: 100,
    numeroMesa: 'Barra Principal',
    capacidad: 6,
    estado: 'O',
    shape: 'barra',
    monto: 38500,
    totalVentasDia: 142500,
    ventasAbiertasDia: [
      { id: 'vb-1', ids: 201, codigo: '#B-101', hora: '18:10', items: '2x Pisco Sour, 1x Tabla Quesos', monto: 18500, estado: 'abierta', cliente: 'Puesto 1-2' },
      { id: 'vb-2', ids: 202, codigo: '#B-102', hora: '18:25', items: '1x Cerveza Austral, 1x Papas Rústicas', monto: 11000, estado: 'abierta', cliente: 'Puesto 4' },
      { id: 'vb-3', ids: 203, codigo: '#B-103', hora: '18:42', items: '1x Gin Tonic Especial', monto: 9000, estado: 'abierta', cliente: 'Puesto 5' }
    ],
    config: this.getEstadoConfig('O'),
    tieneCuentaActiva: true
  };

  // 4 Filas alineadas del Salón Principal: Costados Cuadradas, Centro Redondas
  public filasPlano: FilaPlano[] = [
    // Fila 1: Izq (Cuadrada) | Centro (Redonda) | Der (Cuadrada)
    {
      numeroFila: 1,
      mesaIzq: {
        id: 'sp-01',
        ids: 101,
        numeroMesa: '01',
        capacidad: 4,
        estado: 'D',
        shape: 'cuadrada',
        monto: 0,
        config: this.getEstadoConfig('D'),
        tieneCuentaActiva: false
      },
      mesaCentro: {
        id: 'sp-05',
        ids: 105,
        numeroMesa: '05',
        capacidad: 4,
        estado: 'O',
        shape: 'redonda',
        monto: 18800,
        itemsComanda: [
          { id: 'it-1', productoId: 'p-1', nombre: 'Pisco Sour Catedral', precio: 6900, cantidad: 1 },
          { id: 'it-2', productoId: 'p-12', nombre: 'Ceviche Mixto Tradicional', precio: 11900, cantidad: 1 }
        ],
        config: this.getEstadoConfig('O'),
        tieneCuentaActiva: true
      },
      mesaDer: {
        id: 'sp-09',
        ids: 109,
        numeroMesa: '09',
        capacidad: 4,
        estado: 'D',
        shape: 'cuadrada',
        monto: 0,
        itemsComanda: [],
        config: this.getEstadoConfig('D'),
        tieneCuentaActiva: false
      }
    },
    // Fila 2: Izq (Cuadrada) | Centro (Redonda) | Der (Cuadrada)
    {
      numeroFila: 2,
      mesaIzq: {
        id: 'sp-02',
        ids: 102,
        numeroMesa: '02',
        capacidad: 4,
        estado: 'O',
        shape: 'cuadrada',
        monto: 59000,
        itemsComanda: [
          { id: 'it-3', productoId: 'p-6', nombre: 'Lomo Vetado Angus 350g', precio: 16900, cantidad: 2 },
          { id: 'it-4', productoId: 'p-10', nombre: 'Tabla de Quesos y Jamón Serrano', precio: 14500, cantidad: 1 },
          { id: 'it-5', productoId: 'p-2', nombre: 'Cerveza Austral Calafate', precio: 4500, cantidad: 1 },
          { id: 'it-6', productoId: 'p-3', nombre: 'Aperol Spritz', precio: 6200, cantidad: 1 }
        ],
        config: this.getEstadoConfig('O'),
        tieneCuentaActiva: true
      },
      mesaCentro: {
        id: 'sp-06',
        ids: 106,
        numeroMesa: '06',
        capacidad: 4,
        estado: 'D',
        shape: 'redonda',
        monto: 0,
        config: this.getEstadoConfig('D'),
        tieneCuentaActiva: false
      },
      mesaDer: {
        id: 'sp-10',
        ids: 110,
        numeroMesa: '10',
        capacidad: 4,
        estado: 'O',
        shape: 'cuadrada',
        monto: 42000,
        config: this.getEstadoConfig('O'),
        tieneCuentaActiva: true
      }
    },
    // Fila 3: Izq (Cuadrada) | Centro (Redonda) | Der (Cuadrada)
    {
      numeroFila: 3,
      mesaIzq: {
        id: 'sp-03',
        ids: 103,
        numeroMesa: '03',
        capacidad: 4,
        estado: 'CS',
        shape: 'cuadrada',
        monto: 29800,
        config: this.getEstadoConfig('CS'),
        tieneCuentaActiva: true
      },
      mesaCentro: {
        id: 'sp-07',
        ids: 107,
        numeroMesa: '07',
        capacidad: 4,
        estado: 'R',
        shape: 'redonda',
        monto: 0,
        config: this.getEstadoConfig('R'),
        tieneCuentaActiva: false
      },
      mesaDer: {
        id: 'sp-11',
        ids: 111,
        numeroMesa: '11',
        capacidad: 4,
        estado: 'EM',
        shape: 'cuadrada',
        monto: 0,
        config: this.getEstadoConfig('EM'),
        tieneCuentaActiva: false
      }
    },
    // Fila 4: Izq (Cuadrada) | Centro (Redonda) | Der (Cuadrada)
    {
      numeroFila: 4,
      mesaIzq: {
        id: 'sp-04',
        ids: 104,
        numeroMesa: '04',
        capacidad: 4,
        estado: 'D',
        shape: 'cuadrada',
        monto: 0,
        config: this.getEstadoConfig('D'),
        tieneCuentaActiva: false
      },
      mesaCentro: {
        id: 'sp-08',
        ids: 108,
        numeroMesa: '08',
        capacidad: 4,
        estado: 'L',
        shape: 'redonda',
        monto: 0,
        config: this.getEstadoConfig('L'),
        tieneCuentaActiva: false
      },
      mesaDer: {
        id: 'sp-12',
        ids: 112,
        numeroMesa: '12',
        capacidad: 4,
        estado: 'D',
        shape: 'cuadrada',
        monto: 0,
        config: this.getEstadoConfig('D'),
        tieneCuentaActiva: false
      }
    }
  ];

  // Saber si está activo el Salón Principal
  public esSalonPrincipal = computed(() => {
    const zona = this.zonas().find(z => z.ids === this.zonaActivaId());
    if (!zona) return true;
    return zona.nombre.toLowerCase().includes('principal') || zona.nombre.toLowerCase().includes('salón') || zona.nombre.toLowerCase().includes('salon');
  });

  // Catálogo gastronómico por defecto si la base de datos está offline o vacía
  private catalogoPorDefecto: Categoria[] = [
    {
      id: 'cat-bebidas',
      nombre: 'Bebidas y Barra',
      orden: 1,
      productos: [
        { id: 'p-1', nombre: 'Pisco Sour Catedral', precio: 6900 },
        { id: 'p-2', nombre: 'Cerveza Austral Calafate', precio: 4500 },
        { id: 'p-3', nombre: 'Aperol Spritz', precio: 6200 },
        { id: 'p-4', nombre: 'Limonada Menta Jengibre', precio: 3800 },
        { id: 'p-5', nombre: 'Gin Tonic Hendricks', precio: 7900 }
      ]
    },
    {
      id: 'cat-fondos',
      nombre: 'Platos de Fondo',
      orden: 2,
      productos: [
        { id: 'p-6', nombre: 'Lomo Vetado Angus 350g', precio: 16900 },
        { id: 'p-7', nombre: 'Salmón Grillé con Risotto', precio: 15400 },
        { id: 'p-8', nombre: 'Pasta Fresca Frutti di Mare', precio: 13900 },
        { id: 'p-9', nombre: 'Hamburguesa Gastrosuite', precio: 10900 }
      ]
    },
    {
      id: 'cat-entradas',
      nombre: 'Piqueos y Entradas',
      orden: 3,
      productos: [
        { id: 'p-10', nombre: 'Tabla de Quesos y Jamón Serrano', precio: 14500 },
        { id: 'p-11', nombre: 'Papas Rústicas Trufadas', precio: 6500 },
        { id: 'p-12', nombre: 'Ceviche Mixto Tradicional', precio: 11900 },
        { id: 'p-13', nombre: 'Empanaditas de Mechada (4u)', precio: 7200 }
      ]
    },
    {
      id: 'cat-postres',
      nombre: 'Postres y Cafés',
      orden: 4,
      productos: [
        { id: 'p-14', nombre: 'Tiramisú Artesanal', precio: 4900 },
        { id: 'p-15', nombre: 'Volcán de Chocolate Belga', precio: 5200 },
        { id: 'p-16', nombre: 'Espresso Doble', precio: 2400 }
      ]
    }
  ];

  constructor(
    private salonService: SalonService,
    private menuService: MenúuService
  ) {}

  ngOnInit() {
    this.cargarDatos();
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    this.menuService.obtenerCategorias().subscribe({
      next: (cats: Categoria[]) => {
        if (cats && cats.length > 0) {
          this.catalogoCategorias.set(cats);
        } else {
          this.catalogoCategorias.set(this.catalogoPorDefecto);
        }
      },
      error: () => {
        this.catalogoCategorias.set(this.catalogoPorDefecto);
      }
    });
  }

  cargarDatos() {
    this.salonService.obtenerAreas().subscribe({
      next: (areas: AreaSalon[]) => {
        if (areas && areas.length > 0) {
          this.zonas.set(areas);
          const principal = areas.find(a => a.nombre.toLowerCase().includes('principal')) || areas[0];
          this.zonaActivaId.set(principal.ids);
        }
      },
      error: () => {
        // Mantiene valores por defecto
      }
    });
  }

  public cambiarZona(id: any): void {
    if (id === null || id === undefined || id === '') return;
    const numId = Number(id);
    this.zonaActivaId.set(numId);
    this.showCapa2 = false;
    this.showCapa3 = false;
    this.modoTomarPedido.set(false);

    const zona = this.zonas().find(z => z.ids === numId);
    const esPrincipal = !zona || zona.nombre.toLowerCase().includes('principal');

    if (!esPrincipal) {
      this.salonService.obtenerMesasPorArea(numId).subscribe({
        next: (mesas: Mesa[]) => {
          const mapeadas = (mesas || []).map(m => ({
            ...m,
            shape: (m.shape as any) || 'redonda',
            capacidad: m.capacidad || 4,
            config: this.getEstadoConfig(m.estado),
            monto: (m as any).monto || 0,
            tieneCuentaActiva: (m.estado === 'O' || m.estado === 'CS') && (m as any).monto > 0
          }));
          this.mesasOtrasZonas.set(mapeadas);
        },
        error: () => {
          this.mesasOtrasZonas.set([]);
        }
      });
    }
  }

  toggleCapa2(event: Event, mesa: MesaPlano) {
    event.stopPropagation();
    this.mesaActiva = mesa;
    this.showCapa2 = !this.showCapa2;
    this.showCapa3 = false;
    this.modoTomarPedido.set(false);
  }

  openCapa3(event: Event, mesa: MesaPlano) {
    event.stopPropagation();
    this.mesaActiva = mesa;
    this.showCapa3 = true;
    this.showCapa2 = false;
    this.modoTomarPedido.set(false);
  }

  iniciarTomaPedido(event: Event, mesa: MesaPlano) {
    event.stopPropagation();
    this.mesaActiva = mesa;
    this.showCapa3 = true;
    this.showCapa2 = false;
    this.modoTomarPedido.set(true);
    this.pedidoBorrador.set([]);
    this.categoriaActivaId.set('todas');
  }

  cerrarTomaPedido() {
    this.modoTomarPedido.set(false);
    this.pedidoBorrador.set([]);
  }

  seleccionarCategoria(catId: string) {
    this.categoriaActivaId.set(catId);
  }

  agregarProductoAlPedido(prod: Producto) {
    const actual = [...this.pedidoBorrador()];
    const index = actual.findIndex(it => it.productoId === prod.id);
    if (index >= 0) {
      actual[index] = { ...actual[index], cantidad: actual[index].cantidad + 1 };
    } else {
      actual.push({
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productoId: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        cantidad: 1
      });
    }
    this.pedidoBorrador.set(actual);
  }

  cambiarCantidadBorrador(productoId: string, delta: number) {
    const actual = [...this.pedidoBorrador()];
    const index = actual.findIndex(it => it.productoId === productoId);
    if (index >= 0) {
      const nuevaCantidad = actual[index].cantidad + delta;
      if (nuevaCantidad > 0) {
        actual[index] = { ...actual[index], cantidad: nuevaCantidad };
        this.pedidoBorrador.set(actual);
      } else {
        this.eliminarDelBorrador(productoId);
      }
    }
  }

  eliminarDelBorrador(productoId: string) {
    this.pedidoBorrador.set(this.pedidoBorrador().filter(it => it.productoId !== productoId));
  }

  confirmarComandaMesa() {
    if (!this.mesaActiva || this.pedidoBorrador().length === 0) return;

    const subtotal = this.subtotalBorrador();
    const itemsNuevos = [...this.pedidoBorrador()];

    // Si la mesa estaba en Disponible ('D'), pasa a Ocupada ('O')
    if (this.mesaActiva.estado === 'D') {
      this.mesaActiva.estado = 'O';
      this.mesaActiva.config = this.getEstadoConfig('O');
      this.mesaActiva.tieneCuentaActiva = true;
    }

    if (!this.mesaActiva.itemsComanda) {
      this.mesaActiva.itemsComanda = [];
    }
    this.mesaActiva.itemsComanda.push(...itemsNuevos);
    this.mesaActiva.monto = (this.mesaActiva.monto || 0) + subtotal;
    this.mesaActiva.tieneCuentaActiva = true;

    // Si es barra, registrar nueva venta abierta en su historial del día
    if (this.mesaActiva.shape === 'barra') {
      const numTicket = 100 + ((this.mesaActiva.ventasAbiertasDia?.length || 0) + 1);
      const resumenTexto = itemsNuevos.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');
      const horaStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (!this.mesaActiva.ventasAbiertasDia) {
        this.mesaActiva.ventasAbiertasDia = [];
      }
      this.mesaActiva.ventasAbiertasDia.unshift({
        id: 'vb-' + Date.now(),
        ids: 200 + this.mesaActiva.ventasAbiertasDia.length + 1,
        codigo: `#B-${numTicket}`,
        hora: horaStr,
        items: resumenTexto,
        monto: subtotal,
        estado: 'abierta',
        cliente: 'Cliente Barra'
      });

      this.mesaActiva.totalVentasDia = (this.mesaActiva.totalVentasDia || 0) + subtotal;
    }

    // Resetear borrador y volver a la gestión de comanda
    this.pedidoBorrador.set([]);
    this.modoTomarPedido.set(false);
  }

  closeCapa2(event: Event) {
    event.stopPropagation();
    this.showCapa2 = false;
  }

  closeCapa3() {
    this.showCapa3 = false;
    this.modoTomarPedido.set(false);
    this.pedidoBorrador.set([]);
  }

  getEstadoConfig(estado: string | null | undefined) {
    if (estado === 'D') return { bg: '#D96B27', isPasive: false, label: 'Disponible', icono: 'fa-check' };
    if (estado === 'O') return { bg: '#5E8237', isPasive: false, label: 'Ocupada', icono: 'fa-user-friends' };
    if (estado === 'CS') return { bg: '#A33129', isPasive: false, label: 'Cuenta Solicitada', icono: 'fa-receipt' };
    if (estado === 'R') return { bg: '#8A6E85', isPasive: true, label: 'Reservada', icono: 'fa-clock' };
    if (estado === 'L') return { bg: '#C47D2B', isPasive: true, label: 'Limpieza', icono: 'fa-broom' };
    if (estado === 'EM') return { bg: '#4A545C', isPasive: true, label: 'Mantenimiento', icono: 'fa-tools' };
    return { bg: '#D96B27', isPasive: false, label: 'Disponible', icono: 'fa-check' };
  }

  formatearCLP(monto: number | null | undefined): string {
    const val = Math.round(Number(monto) || 0);
    const entero = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${entero}`;
  }
}
