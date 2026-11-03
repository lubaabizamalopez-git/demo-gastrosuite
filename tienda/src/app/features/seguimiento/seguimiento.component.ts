import { Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { TiendaService } from '../../core/servicios/tienda.service';
import { resolverUrlImagen } from '../../core/constantes/api.constantes';
import { Seguimiento } from '../../core/modelos/tienda.model';
import { PrecioPipe } from '../../shared/pipes/precio.pipe';
import { BotonComponent } from '../../shared/componentes/boton/boton.component';
import { SpinnerComponent } from '../../shared/componentes/spinner/spinner.component';

const SEGUNDOS_ACTUALIZACION = 20;

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [RouterLink, DatePipe, PrecioPipe, BotonComponent, SpinnerComponent],
  templateUrl: './seguimiento.component.html',
})
export class SeguimientoComponent {
  private tiendaService = inject(TiendaService);

  slug = input.required<string>();
  codigo = input.required<string>();
  /** Resultado que informa el backend al volver de Webpay: aprobado, rechazado o anulado */
  pago = input<string>();

  protected pedido = signal<Seguimiento | null>(null);
  protected noEncontrado = signal(false);
  protected reintentando = signal(false);
  protected errorPago = signal<string | null>(null);
  protected resolverUrlImagen = resolverUrlImagen;

  protected pagado = computed(() => this.pedido()?.estadoPago === 'PAGADO');
  protected cancelado = computed(() => this.pedido()?.pasoActual === 'CANCELADO');
  protected indicePaso = computed(() => {
    const pedido = this.pedido();
    return pedido ? pedido.pasos.findIndex(p => p.codigo === pedido.pasoActual) : -1;
  });
  protected finalizado = computed(() => {
    const pedido = this.pedido();
    return !!pedido && (pedido.pasoActual === 'ENTREGADO' || pedido.pasoActual === 'CANCELADO');
  });

  private actualizacion?: Subscription;

  constructor() {
    // Página privada (sin SEO): se carga solo en el navegador y se actualiza periódicamente
    afterNextRender(() => {
      this.actualizacion = interval(SEGUNDOS_ACTUALIZACION * 1000)
        .pipe(
          startWith(0),
          switchMap(() => this.tiendaService.obtenerSeguimiento(this.slug(), this.codigo())),
        )
        .subscribe({
          next: pedido => {
            this.pedido.set(pedido);
            if (this.finalizado()) this.actualizacion?.unsubscribe();
          },
          error: () => this.noEncontrado.set(true),
        });
    });
    inject(DestroyRef).onDestroy(() => this.actualizacion?.unsubscribe());
  }

  reintentarPago(): void {
    this.reintentando.set(true);
    this.errorPago.set(null);
    this.tiendaService.iniciarPago(this.slug(), this.codigo()).subscribe({
      next: pago => this.tiendaService.redirigirAWebpay(pago),
      error: (error: HttpErrorResponse) => {
        this.reintentando.set(false);
        this.errorPago.set(typeof error.error?.message === 'string' ? error.error.message : 'No pudimos iniciar el pago.');
      },
    });
  }
}
