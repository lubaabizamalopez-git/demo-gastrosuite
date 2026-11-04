import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { TiendaService } from '../../core/servicios/tienda.service';
import { CarritoService } from '../../core/servicios/carrito.service';
import { EmpresaActualService } from '../../core/servicios/empresa-actual.service';
import { ModoVisualService } from '../../core/servicios/modo-visual.service';
import { resolverUrlImagen } from '../../core/constantes/api.constantes';
import { ItemCarrito } from '../../core/modelos/tienda.model';
import { PrecioPipe } from '../../shared/pipes/precio.pipe';
import { BotonComponent } from '../../shared/componentes/boton/boton.component';
import { SpinnerComponent } from '../../shared/componentes/spinner/spinner.component';
import { ModalProximamenteComponent } from '../../shared/componentes/modal-proximamente/modal-proximamente.component';

@Component({
  selector: 'app-tienda-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, PrecioPipe, BotonComponent, SpinnerComponent, ModalProximamenteComponent],
  templateUrl: './tienda-layout.component.html',
})
export class TiendaLayoutComponent {
  private tiendaService = inject(TiendaService);
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  protected carrito = inject(CarritoService);
  protected estado = inject(EmpresaActualService);
  protected modoVisual = inject(ModoVisualService);
  protected esModerno = computed(() => this.modoVisual.modo() === 'moderno');

  slug = input.required<string>();

  protected empresa = this.estado.empresa;
  protected cargando = signal(true);
  protected noEncontrado = signal(false);
  protected inicial = computed(() => this.empresa()?.nombre?.charAt(0)?.toUpperCase() ?? '');
  protected resolverUrlImagen = resolverUrlImagen;

  constructor() {
    toObservable(this.slug)
      .pipe(
        switchMap(slug => {
          this.cargando.set(true);
          this.noEncontrado.set(false);
          this.carrito.usarRestaurante(slug);
          return this.tiendaService.obtenerEmpresa(slug).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(empresa => {
        this.estado.empresa.set(empresa);
        this.noEncontrado.set(!empresa);
        this.cargando.set(false);
      });

    effect(() => {
      const empresa = this.empresa();
      if (!empresa) return;
      this.title.setTitle(`${empresa.nombre} · Pide online`);
      this.meta.updateTag({ name: 'description', content: empresa.descripcion ?? `Pide online en ${empresa.nombre}` });
    });
  }

  abrirProximamente(): void {
    this.estado.mostrarProximamente.set(true);
  }

  cambiarCantidad(item: ItemCarrito, delta: number): void {
    this.carrito.cambiarCantidad(item, item.cantidad + delta);
  }

  irAlCheckout(): void {
    this.carrito.abierto.set(false);
    this.router.navigate(['/', this.slug(), 'checkout']);
  }
}
