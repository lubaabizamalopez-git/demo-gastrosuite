import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, Categoria, Producto } from '../../../../core/services/menu.service';
import { ModalCategoriaComponent } from '../modal-categoria/modal-categoria.component';
import { ModalProductoComponent } from '../modal-producto/modal-producto.component';
import { ModalConfirmacionComponent } from '../../../../shared/components/modal-confirmacion/modal-confirmacion.component';
import { ModalDetalleProductoComponent } from '../modal-detalle-producto/modal-detalle-producto.component';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalCategoriaComponent, ModalProductoComponent, ModalConfirmacionComponent, ModalDetalleProductoComponent],
  templateUrl: './gestion-productos.component.html',
  styleUrls: ['./gestion-productos.component.scss']
})
export class GestionProductosComponent implements OnInit {
  private menuService = inject(MenuService);
  
  categorias: Categoria[] = [];
  cargando = true;
  vistaActual: 'grilla' | 'lista' = 'grilla';
  
  // Búsqueda y Filtros
  terminoBusqueda = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';

  // Estados de los modales de creación/edición
  mostrarModalCategoria = false;
  mostrarModalProducto = false;
  
  categoriaSeleccionada: Categoria | null = null;
  productoSeleccionado: Producto | null = null;
  categoriaIdParaProducto: string | null = null;

  // Estados del modal de confirmación de eliminación
  mostrarModalConfirmacion = false;
  itemAEliminar: { id: string, tipo: 'categoria' | 'producto' | 'categoria_desactivar', nombre: string } | null = null;

  // Estado del modal de detalle
  mostrarModalDetalle = false;
  productoParaDetalle: Producto | null = null;

  // Paginación vista productos
  paginaActualProductos = 1;
  itemsPorPaginaProductos = 10;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.menuService.obtenerCategorias(true).subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando catálogo', err);
        this.cargando = false;
      }
    });
  }

  // Getter para aplanar los productos para la vista de lista
  get todosLosProductos(): any[] {
    const flatList: any[] = [];
    this.categorias.forEach(cat => {
      cat.productos.forEach(prod => {
        flatList.push({
          ...prod,
          categoriaId: cat.id,
          categoriaNombre: cat.nombre
        });
      });
    });
    return flatList;
  }

  get categoriasFiltradas(): Categoria[] {
    const term = this.terminoBusqueda.toLowerCase();
    
    // Primero filtramos los productos de cada categoría
    let filtradas = this.categorias.map(cat => ({
      ...cat,
      productos: cat.productos.filter(prod => {
        const matchBusqueda = prod.nombre.toLowerCase().includes(term) || (prod.sku && prod.sku.toLowerCase().includes(term));
        const matchEstado = this.cumpleFiltro(prod);
        return matchBusqueda && matchEstado;
      })
    }));

    // Luego filtramos las categorías en sí
    filtradas = filtradas.filter(cat => {
      const matchBusqueda = term === '' || cat.nombre.toLowerCase().includes(term) || cat.productos.length > 0;
      
      let matchEstado = this.cumpleFiltro(cat);
      if (cat.productos.length > 0) {
        matchEstado = true; // Si tiene productos que pasaron el filtro, la mostramos
      }
      
      // Requerimiento: En vista por categoría, mostrar solo activas por defecto
      if (this.vistaActual === 'grilla' && this.filtroEstado === 'todos' && term === '') {
        matchEstado = cat.activo === 'A' || cat.productos.length > 0;
      }
      
      // Si la categoría cumple el filtro de estado, y hace match o tiene productos que hacen match
      return matchEstado && matchBusqueda;
    });

    return filtradas;
  }

  get productosFiltradosLista(): any[] {
    const term = this.terminoBusqueda.toLowerCase();
    return this.todosLosProductos.filter(prod => {
      const matchBusqueda = prod.nombre.toLowerCase().includes(term) || (prod.sku && prod.sku.toLowerCase().includes(term));
      const matchEstado = this.cumpleFiltro(prod);
      return matchBusqueda && matchEstado;
    });
  }

  get productosPaginadosLista(): any[] {
    const filtrados = this.productosFiltradosLista;
    const inicio = (this.paginaActualProductos - 1) * this.itemsPorPaginaProductos;
    return filtrados.slice(inicio, inicio + this.itemsPorPaginaProductos);
  }

  get totalPaginasProductos(): number {
    return Math.ceil(this.productosFiltradosLista.length / this.itemsPorPaginaProductos) || 1;
  }

  trackByProducto(index: number, prod: any): string {
    return prod.id;
  }

  cambiarPaginaProductos(delta: number): void {
    const nueva = this.paginaActualProductos + delta;
    if (nueva >= 1 && nueva <= this.totalPaginasProductos) {
      this.paginaActualProductos = nueva;
    }
  }

  private cumpleFiltro(item: any): boolean {
    if (this.filtroEstado === 'todos') return true;
    if (this.filtroEstado === 'activos') return item.activo === 'A';
    return item.activo === 'I';
  }

  cambiarVista(vista: 'grilla' | 'lista') {
    this.vistaActual = vista;
    if (vista === 'lista') {
      this.paginaActualProductos = 1; // Resetear página al cambiar vista
    }
  }

  // --- Toggle Producto ---
  intentarToggleEstadoProducto(prod: any, event: Event): void {
    event.stopPropagation(); // Evitar abrir modal de detalle
    
    const estadoOriginal = prod.activo;
    const nuevoEstado = prod.activo === 'A' ? 'I' : 'A';
    
    // Actualización optimista de la UI sin recargar toda la grilla
    // IMPORTANTE: prod es una copia plana de la vista, debemos mutar el original
    prod.activo = nuevoEstado; // Actualizamos la copia para reflejo inmediato

    // Buscar y mutar el producto original en this.categorias para que no se pierda al reevaluar el getter
    const categoria = this.categorias.find(c => c.id === prod.categoriaId);
    let prodOriginal: Producto | undefined;
    if (categoria) {
      prodOriginal = categoria.productos.find(p => p.id === prod.id);
      if (prodOriginal) {
        prodOriginal.activo = nuevoEstado;
      }
    }

    this.menuService.actualizarProducto(prod.id, { activo: nuevoEstado }).subscribe({
      next: () => {
        // Guardado exitoso en DB, no hacemos cargarDatos() para evitar el "salto" de la tabla
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        // Revertir si falla
        prod.activo = estadoOriginal;
        if (prodOriginal) prodOriginal.activo = estadoOriginal;
      }
    });
  }

  // --- Toggle Categoría ---
  intentarToggleEstadoCategoria(cat: Categoria, event: Event): void {
    event.preventDefault(); 
    event.stopPropagation(); 
    
    if (cat.activo === 'A') {
      // Intentando desactivar, requiere confirmación si queremos desactivar en cascada
      this.itemAEliminar = { id: cat.id, nombre: cat.nombre, tipo: 'categoria' };
      // Usaremos un truco: si pasamos un flag adicional o usamos el modal,
      // pero como `itemAEliminar` ya existe, mejor añadimos un nuevo estado o usamos el mismo confirm con otro mensaje.
      // Ya que el modal de confirmacion en app-gestion-productos solo asume "Eliminación", 
      // lo vamos a adaptar o redirigir al mismo flujo pero con otro tipo de accion, pero requiere tocar shared.
      // Para no complicar, llamaremos directamente al modal de categoria que YA tiene la lógica de confirmación y cascada? No, hagámoslo simple:
      
      // Como el user pidió confirmación:
      this.itemAEliminar = { id: cat.id, nombre: cat.nombre, tipo: 'categoria_desactivar' as any };
      this.mostrarModalConfirmacion = true;
    } else {
      // Intentando activar, se hace directo
      this.menuService.actualizarCategoria(cat.id, { activo: 'A' }).subscribe(() => {
        this.cargarDatos();
      });
    }
  }

  abrirModalCategoria(categoria?: Categoria): void {
    this.categoriaSeleccionada = categoria || null;
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria(recargar: boolean): void {
    this.mostrarModalCategoria = false;
    this.categoriaSeleccionada = null;
    if (recargar) this.cargarDatos();
  }

  abrirModalProducto(categoriaId: string, producto?: Producto): void {
    this.categoriaIdParaProducto = categoriaId;
    this.productoSeleccionado = producto || null;
    this.mostrarModalProducto = true;
  }

  cerrarModalProducto(recargar: boolean): void {
    this.mostrarModalProducto = false;
    this.productoSeleccionado = null;
    this.categoriaIdParaProducto = null;
    if (recargar) this.cargarDatos();
  }

  abrirDetalle(producto: Producto, event: Event) {
    // Evitar que el clic abra el modal si se hizo clic en un botón de acción
    if ((event.target as HTMLElement).closest('.prod-actions')) {
      return;
    }
    this.productoParaDetalle = producto;
    this.mostrarModalDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarModalDetalle = false;
    this.productoParaDetalle = null;
  }

  solicitarEliminacion(id: string, tipo: 'categoria' | 'producto' | 'categoria_desactivar', nombre: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.itemAEliminar = { id, tipo, nombre };
    this.mostrarModalConfirmacion = true;
  }

  confirmarEliminacion(confirmado: boolean): void {
    this.mostrarModalConfirmacion = false;
    if (confirmado && this.itemAEliminar) {
      const { id, tipo } = this.itemAEliminar;
      
      if (tipo === 'categoria') {
        this.menuService.eliminarCategoria(id).subscribe(() => this.cargarDatos());
      } else if (tipo === 'categoria_desactivar') {
        this.menuService.actualizarCategoria(id, { activo: 'I' }).subscribe(() => this.cargarDatos());
      } else {
        this.menuService.eliminarProducto(id).subscribe(() => this.cargarDatos());
      }
    }
    this.itemAEliminar = null;
  }
}
