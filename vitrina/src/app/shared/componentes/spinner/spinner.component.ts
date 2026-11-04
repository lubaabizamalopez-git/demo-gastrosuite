import { Component, input } from '@angular/core';

/** Spinner oficial del UI Kit de GastroSuite */
@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html'
})
export class SpinnerComponent {
  message = input<string>('');
  variant = input<'cubiertos' | 'campana'>('cubiertos');
  size = input<number>(64);
}
