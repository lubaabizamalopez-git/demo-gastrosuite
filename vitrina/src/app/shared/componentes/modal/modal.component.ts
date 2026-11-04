import { Component, HostListener, input, output } from '@angular/core';

/** Modal base del UI Kit: encabezado con título, cuerpo proyectado y cierre con Escape o clic fuera */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#231E1B]/40 backdrop-blur-[2px] p-0 sm:p-4"
         (click)="cerrar.emit()">
      <div class="w-full bg-neutral-surface rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden"
           [class]="anchoClase()"
           role="dialog" aria-modal="true" [attr.aria-label]="titulo()"
           (click)="$event.stopPropagation()">
        @if (titulo()) {
          <div class="flex items-center justify-between px-6 py-4 border-b border-brand-soft/30">
            <h2 class="text-lg font-bold text-brand-dark tracking-tight m-0">{{ titulo() }}</h2>
            <button type="button" (click)="cerrar.emit()"
                    class="flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-brand-primary hover:bg-brand-cream transition-colors"
                    aria-label="Cerrar">
              <i class="fas fa-times text-base"></i>
            </button>
          </div>
        }
        <div class="overflow-y-auto">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  titulo = input<string>('');
  anchoClase = input<string>('sm:max-w-md');
  cerrar = output<void>();

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrar.emit();
  }
}
