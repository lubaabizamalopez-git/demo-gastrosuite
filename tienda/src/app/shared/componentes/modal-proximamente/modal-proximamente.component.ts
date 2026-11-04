import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { BotonComponent } from '../boton/boton.component';

/** Aviso para funcionalidades que llegan en una próxima etapa (ej. registro de clientes) */
@Component({
  selector: 'app-modal-proximamente',
  standalone: true,
  imports: [ModalComponent, BotonComponent],
  template: `
    <app-modal (cerrar)="cerrar.emit()">
      <div class="px-8 pt-10 pb-8 text-center">
        <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream">
          <i class="fas fa-gift text-2xl text-brand-primary"></i>
        </div>
        <span class="inline-block mb-3 rounded-full bg-brand-cream px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-dark">
          Próximamente
        </span>
        <h3 class="text-xl font-bold text-text-title mb-2">{{ titulo() }}</h3>
        <p class="text-sm leading-relaxed text-text-body mb-7">{{ mensaje() }}</p>
        <app-boton label="Entendido" size="lg" (btnClick)="cerrar.emit()"></app-boton>
      </div>
    </app-modal>
  `,
})
export class ModalProximamenteComponent {
  titulo = input<string>('Muy pronto podrás crear tu cuenta');
  mensaje = input<string>(
    'Estamos preparando el registro de clientes para que guardes tus direcciones, repitas tus pedidos favoritos y recibas beneficios. Mientras tanto, puedes comprar como invitado.',
  );
  cerrar = output<void>();
}
