import { Component, input, output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-drawer.component.html'
})
export class FilterDrawerComponent {
  // Se�al que define si el panel lateral est� visible
  isOpen = input.required<boolean>();
  
  // Eventos para notificar el cierre o la ejecuci�n de acciones
  close = output<void>();
  apply = output<void>();
  clear = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onApply(): void {
    this.apply.emit();
  }

  onClear(): void {
    this.clear.emit();
  }

  // Cierre limpio con la tecla ESC
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }
}
