import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService, Categoria } from '../../../../core/services/menu.service';
import { ModalConfirmacionComponent } from '../../../../shared/components/modal-confirmacion/modal-confirmacion.component';

@Component({
  selector: 'app-modal-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalConfirmacionComponent],
  templateUrl: './modal-categoria.component.html',
  styleUrls: ['./modal-categoria.component.scss']
})
export class ModalCategoriaComponent implements OnInit {
  @Input() categoria: Categoria | null = null;
  @Output() cerrar = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private menuService = inject(MenuService);

  categorias: Categoria[] = [];
  cargandoCategorias = false;

  form: FormGroup;
  guardando = false;
  categoriaEnEdicion: Categoria | null = null;

  huboCambios = false;

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  // Confirmación
  mostrarModalConfirmacion = false;
  accionPendiente: { id: string, nombre: string, tipoAccion: 'eliminar' | 'desactivar' | 'swap_orden' | 'desactivar_editar', catRef?: Categoria, datosGuardar?: any } | null = null;

  opcionesOrden: number[] = [1];

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      activo: [true],
      orden: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    
    if (this.categoria) {
      this.editarCategoria(this.categoria);
    }
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.menuService.obtenerCategorias(true).subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargandoCategorias = false;
        this.actualizarOpcionesOrden();
        this.verificarPaginacion();
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.cargandoCategorias = false;
      }
    });
  }

  // Lógica de Paginación
  get categoriasPaginadas(): Categoria[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.categorias.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.categorias.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(delta: number): void {
    const nuevaPagina = this.paginaActual + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  private verificarPaginacion(): void {
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }
  }

  actualizarOpcionesOrden(): void {
    const maxOrdenActual = this.categorias.length > 0 ? Math.max(...this.categorias.map(c => c.orden || 0)) : 0;
    const maxOpcion = this.categoriaEnEdicion ? Math.max(maxOrdenActual, 1) : maxOrdenActual + 1;
    this.opcionesOrden = Array.from({length: maxOpcion}, (_, i) => i + 1);
    
    // Asignar el último orden por defecto si es creación y el valor actual es 0 o null
    if (!this.categoriaEnEdicion) {
      const ordenActual = this.form.get('orden')?.value;
      if (!ordenActual || ordenActual === 0) {
        this.form.patchValue({ orden: maxOpcion });
      }
    }
  }

  editarCategoria(cat: Categoria): void {
    this.categoriaEnEdicion = cat;
    this.actualizarOpcionesOrden();
    this.form.patchValue({
      nombre: cat.nombre,
      activo: cat.activo === 'A' ? true : (cat.activo === 'I' ? false : true),
      orden: cat.orden || 1
    });
    
    // Smooth scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  cancelarEdicion(): void {
    this.categoriaEnEdicion = null;
    this.actualizarOpcionesOrden();
    const defaultOrden = this.opcionesOrden.length > 0 ? this.opcionesOrden[this.opcionesOrden.length - 1] : 1;
    this.form.reset({ activo: true, orden: defaultOrden });
  }

  onCerrar(): void {
    // Si hubo cambios (crear, editar, eliminar), le avisamos al padre para que recargue
    this.cerrar.emit(this.huboCambios);
  }

  guardar(): void {
    if (this.form.invalid) return;

    const datosRaw = this.form.value;
    const datos = {
      ...datosRaw,
      orden: Number(datosRaw.orden),
      activo: datosRaw.activo ? 'A' : 'I'
    };

    // 1. Verificar desactivación (si estaba activa y ahora está inactiva)
    if (this.categoriaEnEdicion && this.categoriaEnEdicion.activo === 'A' && datos.activo === 'I') {
      this.accionPendiente = {
        id: this.categoriaEnEdicion.id,
        nombre: this.categoriaEnEdicion.nombre,
        tipoAccion: 'desactivar_editar',
        datosGuardar: datos
      };
      this.mostrarModalConfirmacion = true;
      return;
    }

    this.validarOrdenYGuardar(datos);
  }

  private validarOrdenYGuardar(datos: any): void {
    // Verificar si el orden ya está en uso por OTRA categoría
    const ordenSolicitado = datos.orden;
    const categoriaConflicto = this.categorias.find(c => c.orden === ordenSolicitado && c.id !== this.categoriaEnEdicion?.id);

    if (categoriaConflicto) {
      // Pedir confirmación para el swap
      this.accionPendiente = {
        id: categoriaConflicto.id,
        nombre: categoriaConflicto.nombre,
        tipoAccion: 'swap_orden',
        datosGuardar: datos
      };
      this.mostrarModalConfirmacion = true;
      return;
    }

    this.ejecutarGuardado(datos);
  }

  private ejecutarGuardado(datos: any): void {
    this.guardando = true;
    const peticion = this.categoriaEnEdicion 
      ? this.menuService.actualizarCategoria(this.categoriaEnEdicion.id, datos)
      : this.menuService.crearCategoria(datos);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.huboCambios = true;
        this.cancelarEdicion(); // Resetear form
        this.cargarCategorias(); // Recargar la grilla inferior
      },
      error: (err: any) => {
        console.error('Error guardando categoría', err);
        this.guardando = false;
      }
    });
  }

  // Acciones en la grilla
  eliminarCategoria(id: string, nombre: string): void {
    this.accionPendiente = { id, nombre, tipoAccion: 'eliminar' };
    this.mostrarModalConfirmacion = true;
  }

  intentarToggleEstado(cat: Categoria, event: Event): void {
    event.preventDefault(); // Evita que el checkbox cambie visualmente hasta confirmar
    if (cat.activo === 'A') {
      // Intentando desactivar, requiere confirmación
      this.accionPendiente = { id: cat.id, nombre: cat.nombre, tipoAccion: 'desactivar', catRef: cat };
      this.mostrarModalConfirmacion = true;
    } else {
      // Intentando activar, se hace directo
      this.actualizarEstadoInmediato(cat.id, 'A');
    }
  }

  confirmarAccion(confirmado: boolean): void {
    this.mostrarModalConfirmacion = false;
    
    if (confirmado && this.accionPendiente) {
      if (this.accionPendiente.tipoAccion === 'eliminar') {
        this.menuService.eliminarCategoria(this.accionPendiente.id).subscribe(() => {
          this.huboCambios = true;
          this.cargarCategorias();
        });
      } else if (this.accionPendiente.tipoAccion === 'desactivar') {
        this.actualizarEstadoInmediato(this.accionPendiente.id, 'I');
      } else if (this.accionPendiente.tipoAccion === 'swap_orden') {
        this.ejecutarGuardado(this.accionPendiente.datosGuardar);
      } else if (this.accionPendiente.tipoAccion === 'desactivar_editar') {
        this.validarOrdenYGuardar(this.accionPendiente.datosGuardar);
      }
    }
    this.accionPendiente = null;
  }

  private actualizarEstadoInmediato(id: string, nuevoEstado: 'A' | 'I'): void {
    this.menuService.actualizarCategoria(id, { activo: nuevoEstado }).subscribe(() => {
      this.huboCambios = true;
      this.cargarCategorias();
    });
  }
}
