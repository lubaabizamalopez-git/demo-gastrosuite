import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-header.component.html'
})
export class SectionHeaderComponent {
  title = input<string>('');
  description = input<string>('');
}
