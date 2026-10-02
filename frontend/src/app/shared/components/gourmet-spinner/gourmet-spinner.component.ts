import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gs-gourmet-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gourmet-spinner.component.html'
})
export class GourmetSpinnerComponent {
  // Mensaje opcional configurable por el POS (Ej: "Cargando comanda...", "Procesando pago...")
  message = input<string>('');
  
  // Variante de icono visual central: 'cubiertos' o 'campana'
  variant = input<'cubiertos' | 'campana'>('cubiertos');
}
