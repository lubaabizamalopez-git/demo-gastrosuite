import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-header.component.html'
})
export class ViewHeaderComponent {
  title = input<string>('');
  subtitle = input<string>('');
}
