import { Component, inject, input, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { catchError, of, switchMap, tap } from 'rxjs';
import { VitrinaService } from '../../core/servicios/vitrina.service';
import { CarritoService } from '../../core/servicios/carrito.service';
import { EmpresaActualService } from '../../core/servicios/empresa-actual.service';
import { resolverUrlImagen } from '../../core/constantes/api.constantes';
import { Categoria, Producto } from '../../core/modelos/vitrina.model';
import { PrecioPipe } from '../../shared/pipes/precio.pipe';
import { BotonComponent } from '../../shared/componentes/boton/boton.component';
import { SpinnerComponent } from '../../shared/componentes/spinner/spinner.component';
import { ModalComponent } from '../../shared/componentes/modal/modal.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [PrecioPipe, BotonComponent, SpinnerComponent, ModalComponent],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  private vitrinaService = inject(VitrinaService);
  private document = inject(DOCUMENT);
  protected carrito = inject(CarritoService);
  protected estado = inject(EmpresaActualService);

  slug = input.required<string>();

  protected empresa = this.estado.empresa;
  protected categorias = signal<Categoria[]>([]);
  protected cargandoMenu = signal(true);
  protected errorMenu = signal(false);
  protected resolverUrlImagen = resolverUrlImagen;

  // Detalle de producto
  protected productoSeleccionado = signal<Producto | null>(null);
  protected cantidad = signal(1);
  protected notas = signal('');
  protected agregadoReciente = signal<string | null>(null);

  constructor() {
    toObservable(this.slug)
      .pipe(
        tap(() => this.cargandoMenu.set(true)),
        switchMap(slug => this.vitrinaService.obtenerMenu(slug).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe(menu => {
        this.categorias.set(menu ?? []);
        this.errorMenu.set(menu === null);
        this.cargandoMenu.set(false);
      });
  }

  irACategoria(categoria: Categoria): void {
    this.document.getElementById(`categoria-${categoria.ids}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  abrirProducto(producto: Producto): void {
    this.productoSeleccionado.set(producto);
    this.cantidad.set(1);
    this.notas.set('');
  }

  cerrarProducto(): void {
    this.productoSeleccionado.set(null);
  }

  cambiarCantidad(delta: number): void {
    this.cantidad.update(c => Math.min(Math.max(c + delta, 1), 50));
  }

  agregarSeleccionado(): void {
    const producto = this.productoSeleccionado();
    if (!producto) return;
    this.carrito.agregar(producto, this.cantidad(), this.notas().trim());
    this.marcarAgregado(producto);
    this.cerrarProducto();
  }

  agregarRapido(producto: Producto, evento: Event): void {
    evento.stopPropagation();
    this.carrito.agregar(producto);
    this.marcarAgregado(producto);
  }

  private marcarAgregado(producto: Producto): void {
    this.agregadoReciente.set(producto.id);
    setTimeout(() => {
      if (this.agregadoReciente() === producto.id) this.agregadoReciente.set(null);
    }, 1200);
  }
}
