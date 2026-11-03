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
        <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5F0]">
          <i class="fas fa-gift text-2xl text-[#FF6B00]"></i>
        </div>
        <span class="inline-block mb-3 rounded-full bg-[#FFF5F0] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#CC5500]">
          Próximamente
        </span>
        <h3 class="text-xl font-bold text-[#231E1B] mb-2">{{ titulo() }}</h3>
        <p class="text-sm leading-relaxed text-[#5C534E] mb-7">{{ mensaje() }}</p>
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
