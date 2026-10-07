import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenúuService, Producto, Categoria } from '../../core/services/menu.service';
import { PedidoService, PedidoDTO, ItemPedidoDTO } from '../../core/services/pedido.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';

interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {
  private menuService = inject(MenúuService);
  private pedidoService = inject(PedidoService);
  private http = inject(HttpClient);

  categorias: Categoria[] = [];
  productosMostrados: Producto[] = [];
  categoriaSeleccionada: string = 'TODAS';
  
  carrito: CartItem[] = [];
  
  subtotal: number = 0;
  impuestos: number = 0;
  total: number = 0;
  porcentajeImpuesto: number = 0.19;

  cargando: boolean = false;
  
  tipoPedido: 'SALON' | 'PARA_LLEVAR' | 'DELIVERY' = 'SALON';
  opcionesTipoPedido: SelectOption[] = [
    { value: 'SALON', label: 'Para Servir' },
    { value: 'PARA_LLEVAR', label: 'Para Llevar' },
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
  
  ngOnInit(): void {
    this.cargarCatalogo();
    this.cargarAreasYMesas();
  }

  cargarAreasYMesas() {
    this.http.get<any[]>('http://localhost:3000/api/salon/areas').subscribe(res => {
      this.areas = res;
      this.opcionesSalones = [
        { value: 'TODOS', label: 'Ver todos' },
        ...res.map(a => ({ value: a.id, label: a.nombre }))
      ];
    });
    // Cargar Mesas
    this.http.get<any[]>('http://localhost:3000/api/salon/mesas').subscribe(res => {
      this.todasLasMesas = res;
      this.filtrarMesas();
    });
  }

  filtrarMesas() {
    if (this.salonSeleccionado === 'TODOS') {
      this.mesasMostradas = this.todasLasMesas;
    } else {
      this.mesasMostradas = this.todasLasMesas.filter(m => m.areaSalonId === this.salonSeleccionado);
    }
  }

  cambiarSalon(event: any) {
    this.filtrarMesas();
  }

  seleccionarMesa(mesa: any) {
    if (mesa.estado === 'D') { // Solo si está Disponible/Libre
      this.mesaSeleccionadaId = mesa.id;
      this.tipoPedido = 'SALON';
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
    if (catId === 'TODAS') {
      this.productosMostrados = this.categorias.reduce((acc, cat) => acc.concat(cat.productos || []), [] as Producto[]);
    } else {
      const cat = this.categorias.find(c => c.id === catId);
      this.productosMostrados = cat?.productos || [];
    }
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

  calcularTotales() {
    this.subtotal = this.carrito.reduce((acc, item) => acc + (Number(item.producto.precio) * item.cantidad), 0);
    this.impuestos = this.subtotal * this.porcentajeImpuesto;
    this.total = this.subtotal + this.impuestos;
  }

  enviarPedido() {
    if (this.carrito.length === 0) return;

    this.cargando = true;
    
    const items = this.carrito.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
      precioUnitario: Number(item.producto.precio),
      precioTotal: Number(item.producto.precio) * item.cantidad,
      areaPreparacion: item.producto.areaPreparacion
    }));

    const pedidoData: PedidoDTO = {
      tipoPedido: this.tipoPedido,
      subtotal: this.subtotal,
      impuestos: this.impuestos,
      total: this.total,
      mesaId: this.mesaSeleccionadaId || undefined,
      items: items
    };

    this.pedidoService.crearPedido(pedidoData).subscribe({
      next: (res) => {
        console.log('Pedido enviado!', res);
        this.carrito = [];
        this.mesaSeleccionadaId = null;
        this.calcularTotales();
        this.cargando = false;
        alert('¡Pedido enviado a cocina exitosamente!');
      },
      error: (err) => {
        console.error('Error enviando pedido', err);
        this.cargando = false;
        alert('Ocurrió un error al enviar el pedido');
      }
    });
  }
}

