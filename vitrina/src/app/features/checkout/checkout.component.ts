import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { VitrinaService } from '../../core/servicios/vitrina.service';
import { CarritoService } from '../../core/servicios/carrito.service';
import { EmpresaActualService } from '../../core/servicios/empresa-actual.service';
import { resolverUrlImagen } from '../../core/constantes/api.constantes';
import { CrearPedidoRequest, TipoPedido } from '../../core/modelos/vitrina.model';
import { PrecioPipe } from '../../shared/pipes/precio.pipe';
import { BotonComponent } from '../../shared/componentes/boton/boton.component';
import { OpcionSelector, SelectorComponent } from '../../shared/componentes/selector/selector.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PrecioPipe, BotonComponent, SelectorComponent],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private vitrinaService = inject(VitrinaService);
  protected carrito = inject(CarritoService);
  protected estado = inject(EmpresaActualService);

  slug = input.required<string>();

  protected empresa = this.estado.empresa;
  protected resolverUrlImagen = resolverUrlImagen;
  protected tipoPedido = signal<TipoPedido>('PARA_LLEVAR');
  protected enviando = signal(false);
  protected errorEnvio = signal<string | null>(null);
  protected intentoEnviar = signal(false);

  protected opcionesComuna = toSignal(
    this.vitrinaService.obtenerComunas().pipe(
      switchMap(comunas => of(comunas.map<OpcionSelector>(c => ({ value: c.id, label: c.nombre })))),
      catchError(() => of([] as OpcionSelector[])),
    ),
    { initialValue: [] as OpcionSelector[] },
  );

  protected formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s]{8,15}$/)]],
    comunaId: [null as number | null],
    calle: ['', [Validators.maxLength(150)]],
    numero: ['', [Validators.maxLength(20)]],
    depto: ['', [Validators.maxLength(30)]],
    referencia: ['', [Validators.maxLength(150)]],
    notas: ['', [Validators.maxLength(180)]],
  });

  protected esDelivery = computed(() => this.tipoPedido() === 'DELIVERY');
  protected costoDelivery = computed(() => (this.esDelivery() ? this.empresa()?.costoDelivery ?? 0 : 0));
  protected total = computed(() => this.carrito.totalProductos() + this.costoDelivery());
  protected faltaParaMinimo = computed(() => {
    const minimo = this.empresa()?.montoMinimoDelivery ?? 0;
    return this.esDelivery() ? Math.max(minimo - this.carrito.totalProductos(), 0) : 0;
  });

  constructor() {
    // Si el local no acepta retiro, el checkout parte en delivery
    effect(() => {
      const empresa = this.empresa();
      if (empresa && !empresa.aceptaRetiro && empresa.aceptaDelivery) {
        this.cambiarTipo('DELIVERY');
      }
    }, { allowSignalWrites: true });
  }

  cambiarTipo(tipo: TipoPedido): void {
    this.tipoPedido.set(tipo);
    const camposDireccion = ['comunaId', 'calle', 'numero'] as const;
    for (const campo of camposDireccion) {
      const control = this.formulario.controls[campo];
      control.setValidators(tipo === 'DELIVERY' ? [Validators.required, Validators.maxLength(150)] : [Validators.maxLength(150)]);
      control.updateValueAndValidity();
    }
  }

  mostrarError(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  pagar(): void {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid || this.carrito.items().length === 0 || this.faltaParaMinimo() > 0) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const pedido: CrearPedidoRequest = {
      tipoPedido: this.tipoPedido(),
      cliente: {
        nombre: valores.nombre.trim(),
        apellido: valores.apellido.trim() || undefined,
        correo: valores.correo.trim(),
        telefono: valores.telefono.trim(),
      },
      direccion: this.esDelivery()
        ? {
            comunaId: valores.comunaId ?? undefined,
            calle: valores.calle.trim(),
            numero: valores.numero.trim(),
            depto: valores.depto.trim() || undefined,
            referencia: valores.referencia.trim() || undefined,
          }
        : undefined,
      notas: valores.notas.trim() || undefined,
      items: this.carrito.items().map(i => ({
        productoId: i.producto.id,
        cantidad: i.cantidad,
        notas: i.notas || undefined,
      })),
    };

    this.enviando.set(true);
    this.vitrinaService
      .crearPedido(this.slug(), pedido)
      .pipe(switchMap(creado => this.vitrinaService.iniciarPago(this.slug(), creado.codigoSeguimiento)))
      .subscribe({
        next: pago => {
          this.carrito.vaciar();
          this.vitrinaService.redirigirAWebpay(pago);
        },
        error: (error: HttpErrorResponse) => {
          this.enviando.set(false);
          const mensaje = error.error?.message;
          this.errorEnvio.set(
            typeof mensaje === 'string' ? mensaje : 'No pudimos procesar tu pedido. Revisa tus datos e intenta nuevamente.',
          );
        },
      });
  }
}
