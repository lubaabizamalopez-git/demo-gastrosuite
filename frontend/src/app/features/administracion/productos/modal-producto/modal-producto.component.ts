import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService, Producto, Categoria } from '../../../../core/services/menu.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-modal-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-producto.component.html',
  styleUrls: ['./modal-producto.component.scss']
})
export class ModalProductoComponent implements OnInit {
  @Input() producto: Producto | null = null;
  @Input() categoriaId!: string;
  @Output() cerrar = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private menuService = inject(MenuService);

  form: FormGroup;
  guardando = false;
  subiendoImagen = false;
  archivoSeleccionado: File | null = null;
  
  opcionesOrden: number[] = [1];
  opcionesOrdenCategoria: number[] = [1];
  categorias: Categoria[] = [];

  constructor() {
    this.form = this.fb.group({
      categoriaSeleccionada: ['', Validators.required],
      nuevaCategoriaNombre: [''],
      nuevaCategoriaOrden: [1],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      sku: [''],
      imagen: [''],
      activo: [true],
      areaPreparacion: ['COCINA'],
      orden: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.menuService.obtenerCategorias(true).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.inicializarFormulario();
      },
      error: (err) => console.error('Error cargando categorias', err)
    });
    
    this.form.get('categoriaSeleccionada')?.valueChanges.subscribe(val => {
      this.actualizarOpcionesOrden();
    });
  }

  inicializarFormulario(): void {
    if (this.producto) {
      this.form.patchValue({
        categoriaSeleccionada: this.categoriaId,
        nombre: this.producto.nombre,
        descripcion: (this.producto as any).descripcion || '',
        precio: this.producto.precio,
        sku: this.producto.sku,
        imagen: this.producto.imagen,
        activo: this.producto.activo === 'A' ? true : (this.producto.activo === 'I' ? false : true),
        areaPreparacion: (this.producto as any).areaPreparacion || 'COCINA',
        orden: this.producto.orden || 0
      });
    } else {
      this.form.patchValue({ categoriaSeleccionada: this.categoriaId || (this.categorias[0]?.id || 'OTRA') });
    }
    this.actualizarOpcionesOrden();
  }

  actualizarOpcionesOrden(): void {
    const catId = this.form.get('categoriaSeleccionada')?.value;
    const totalCat = this.categorias.length;
    this.opcionesOrdenCategoria = Array.from({length: totalCat + 1}, (_, i) => i + 1);

    if (catId === 'OTRA') {
      this.opcionesOrden = [1];
      this.form.patchValue({ orden: 1, nuevaCategoriaOrden: 1 });
      return;
    }
    
    const categoria = this.categorias.find(c => c.id === catId);
    if (categoria) {
      const total = categoria.productos?.length || 0;
      const esMismaCat = this.producto && this.categoriaId === catId;
      const max = esMismaCat ? Math.max(total, 1) : total + 1;
      this.opcionesOrden = Array.from({length: max}, (_, i) => i + 1);
      
      const ordenActual = this.form.get('orden')?.value;
      if (!esMismaCat || !ordenActual || ordenActual === 0 || !this.opcionesOrden.includes(ordenActual)) {
        this.form.patchValue({ orden: max });
      }
    }
  }

  onCerrar(): void {
    this.cerrar.emit(false);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  guardar(): void {
    if (this.form.invalid) return;

    if (this.archivoSeleccionado) {
      this.subiendoImagen = true;
      this.menuService.subirImagen(this.archivoSeleccionado).subscribe({
        next: (res) => {
          this.subiendoImagen = false;
          this.form.patchValue({ imagen: res.url });
          this.procesarGuardado();
        },
        error: (err) => {
          console.error('Error subiendo imagen', err);
          this.subiendoImagen = false;
        }
      });
    } else {
      this.procesarGuardado();
    }
  }

  private procesarGuardado(): void {
    this.guardando = true;
    const formVal = this.form.value;
    
    if (formVal.categoriaSeleccionada === 'OTRA' && formVal.nuevaCategoriaNombre) {
      const nuevaCat = {
        nombre: formVal.nuevaCategoriaNombre,
        orden: formVal.nuevaCategoriaOrden,
        activo: 'A'
      };
      
      this.menuService.crearCategoria(nuevaCat).pipe(
        switchMap(catResult => {
          return this.ejecutarGuardarProducto(catResult.id, formVal);
        })
      ).subscribe({
        next: () => this.finalizarGuardado(),
        error: (err) => this.manejarErrorGuardado(err)
      });
    } else {
      this.ejecutarGuardarProducto(formVal.categoriaSeleccionada, formVal).subscribe({
        next: () => this.finalizarGuardado(),
        error: (err) => this.manejarErrorGuardado(err)
      });
    }
  }

  private ejecutarGuardarProducto(catId: string, formVal: any) {
    const datos = {
      nombre: formVal.nombre,
      descripcion: formVal.descripcion,
      precio: formVal.precio,
      sku: formVal.sku,
      imagen: formVal.imagen,
      activo: formVal.activo ? 'A' : 'I',
      areaPreparacion: formVal.areaPreparacion,
      orden: formVal.orden,
      categoriaId: catId
    };

    if (this.producto) {
      return this.menuService.actualizarProducto(this.producto.id, datos);
    } else {
      return this.menuService.crearProducto(datos);
    }
  }
  
  private finalizarGuardado(): void {
    this.guardando = false;
    this.cerrar.emit(true);
  }
  
  private manejarErrorGuardado(err: any): void {
    console.error('Error guardando', err);
    this.guardando = false;
  }
}
