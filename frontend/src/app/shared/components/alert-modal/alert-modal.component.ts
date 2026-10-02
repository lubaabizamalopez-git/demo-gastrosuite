import { Component, input, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-modal.component.html'
})
export class AlertModalComponent {
  title = input<string>('Notificaci�n');
  message = input<string>('');
  buttonLabel = input<string>('Aceptar');
  iconLetter = input<string>('!'); // Letra por defecto si no se pasa icono
  type = input<'success' | 'error'>('success');

  confirm = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    this.onConfirm();
  }
}
