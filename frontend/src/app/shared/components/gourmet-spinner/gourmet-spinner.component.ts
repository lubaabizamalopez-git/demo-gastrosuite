import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gs-gourmet-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gourmet-spinner.component.html'
})
export class GourmetSpinnerComponent {
  message = input<string>('');
  variant = input<'cubiertos' | 'campana'>('cubiertos');
  size = input<number>(64); // Tamaño base en pixeles
}
